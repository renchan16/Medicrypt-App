from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import SHA256, HMAC
from Crypto.Cipher import AES
import base64

ALGORITHM_NONCE_SIZE = 12
ALGORITHM_TAG_SIZE = 16
ALGORITHM_KEY_SIZE = 16
PBKDF2_SALT_SIZE = 16
PBKDF2_ITERATIONS = 100
PBKDF2_LAMBDA = lambda x, y: HMAC.new(x, y, SHA256).digest()


def encryptFile(fpath, password):
    # Generate a 128-bit salt using a CSPRNG.
    _salt = get_random_bytes(PBKDF2_SALT_SIZE)

    # Derive a key using PBKDF2.
    _key = PBKDF2(password, _salt, ALGORITHM_KEY_SIZE, PBKDF2_ITERATIONS, PBKDF2_LAMBDA)

    with open(fpath, "rb") as file:
        _plaintext = file.read()

    # Encrypt and prepend salt.
    _ciphertext_nonce = encrypt(_plaintext, _key)
    _ciphertext_nonce_salt = _salt + _ciphertext_nonce

    with open(fpath, "wb") as enc_file:
        enc_file.write(base64.b64encode(_ciphertext_nonce_salt))

    # Return as base64 string.
    return base64.b64encode(_ciphertext_nonce_salt)


def decryptFile(fpath, password, mem_only=True):
    with open(fpath, "rb") as enc_file:
        _base64ciphertext_nonce_salt = enc_file.read()

    # Decode the base64.
    _ciphertext_nonce_salt = base64.b64decode(_base64ciphertext_nonce_salt)

    # Get the salt and ciphertextAndNonce.
    _salt = _ciphertext_nonce_salt[:PBKDF2_SALT_SIZE]
    _ciphertext_and_nonce = _ciphertext_nonce_salt[PBKDF2_SALT_SIZE:]

    # Derive the key using PBKDF2.
    _key = PBKDF2(password, _salt, ALGORITHM_KEY_SIZE, PBKDF2_ITERATIONS, PBKDF2_LAMBDA)

    # Decrypt and return result.
    _plaintext = decrypt(_ciphertext_and_nonce, _key)

    if _plaintext is not None:
        if not mem_only:
            with open(fpath, "wb") as file:
                file.write(_plaintext)

        return _plaintext.decode('utf-8')
    else:
        return None


def encrypt(plaintext, key):
    # Generate a 96-bit nonce using a CSPRNG.
    _nonce = get_random_bytes(ALGORITHM_NONCE_SIZE)

    # Create the cipher.
    _cipher = AES.new(key, AES.MODE_GCM, _nonce)

    # Encrypt and prepend nonce.
    _ciphertext, _tag = _cipher.encrypt_and_digest(plaintext)
    _ciphertext_and_nonce = _nonce + _ciphertext + _tag

    return _ciphertext_and_nonce


def decrypt(ciphertextAndNonce, key):
    # Get the nonce, ciphertext and tag.
    _nonce = ciphertextAndNonce[:ALGORITHM_NONCE_SIZE]
    _ciphertext = ciphertextAndNonce[ALGORITHM_NONCE_SIZE:len(ciphertextAndNonce) - ALGORITHM_TAG_SIZE]
    _tag = ciphertextAndNonce[len(ciphertextAndNonce) - ALGORITHM_TAG_SIZE:]

    # Create the cipher.
    _cipher = AES.new(key, AES.MODE_GCM, _nonce)

    # Decrypt and return result.
    try:
        _plaintext = _cipher.decrypt(_ciphertext)
        _cipher.verify(_tag)
        print("PASSWORD CORRECT")

        return _plaintext

    except ValueError:
        print('WRONG PASSWORD')
        raise
