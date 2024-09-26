from Crypto.Hash import SHA256, HMAC
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2
import base64

ALGORITHM_NONCE_SIZE = 12
ALGORITHM_TAG_SIZE = 16
ALGORITHM_KEY_SIZE = 16
PBKDF2_SALT_SIZE = 16
PBKDF2_ITERATIONS = 100
PBKDF2_LAMBDA = lambda x, y: HMAC.new(x, y, SHA256).digest()


def encryptString(fpath, password):
    # Generate a 128-bit salt using a CSPRNG.
    salt = get_random_bytes(PBKDF2_SALT_SIZE)

    # Derive a key using PBKDF2.
    key = PBKDF2(password, salt, ALGORITHM_KEY_SIZE, PBKDF2_ITERATIONS, PBKDF2_LAMBDA)

    with open(fpath, "rb") as file:
        plaintext = file.read()

    # Encrypt and prepend salt.
    ciphertextAndNonce = encrypt(plaintext, key)
    ciphertextAndNonceAndSalt = salt + ciphertextAndNonce

    with open(fpath, "wb") as enc_file:
        enc_file.write(base64.b64encode(ciphertextAndNonceAndSalt))

    # Return as base64 string.
    return base64.b64encode(ciphertextAndNonceAndSalt)


def decryptString(fpath, password):
    with open(fpath, "rb") as enc_file:
        base64CiphertextAndNonceAndSalt = enc_file.read()

    # Decode the base64.
    ciphertextAndNonceAndSalt = base64.b64decode(base64CiphertextAndNonceAndSalt)

    # Get the salt and ciphertextAndNonce.
    salt = ciphertextAndNonceAndSalt[:PBKDF2_SALT_SIZE]
    ciphertextAndNonce = ciphertextAndNonceAndSalt[PBKDF2_SALT_SIZE:]

    # Derive the key using PBKDF2.
    key = PBKDF2(password, salt, ALGORITHM_KEY_SIZE, PBKDF2_ITERATIONS, PBKDF2_LAMBDA)

    # Decrypt and return result.
    plaintext = decrypt(ciphertextAndNonce, key)

    if plaintext is not None:
        with open(fpath, "wb") as file:
            file.write(plaintext)

        return plaintext.decode('utf-8')
    else:
        return None


def encrypt(plaintext, key):
    # Generate a 96-bit nonce using a CSPRNG.
    nonce = get_random_bytes(ALGORITHM_NONCE_SIZE)

    # Create the cipher.
    cipher = AES.new(key, AES.MODE_GCM, nonce)

    # Encrypt and prepend nonce.
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    ciphertextAndNonce = nonce + ciphertext + tag

    return ciphertextAndNonce


def decrypt(ciphertextAndNonce, key):
    # Get the nonce, ciphertext and tag.
    nonce = ciphertextAndNonce[:ALGORITHM_NONCE_SIZE]
    ciphertext = ciphertextAndNonce[ALGORITHM_NONCE_SIZE:len(ciphertextAndNonce) - ALGORITHM_TAG_SIZE]
    tag = ciphertextAndNonce[len(ciphertextAndNonce) - ALGORITHM_TAG_SIZE:]

    # Create the cipher.
    cipher = AES.new(key, AES.MODE_GCM, nonce)

    # Decrypt and return result.
    try:
        plaintext = cipher.decrypt(ciphertext)
        cipher.verify(tag)
        print("PASSWORD CORRECT")

        return plaintext

    except ValueError:
        print('WRONG PASSWORD')
        raise
