"""
The key_validator.py contains the script for validation of the key file before being used by the algorithm.
This avoids errors and unexpected behaviors of the program when a wrong key file is used

Functionality:
--------------
1. Type Safety:
    - Uses enums to be more type safe, and allows the code authors to avoid running into a typo

2. Exceptions
    - Raises error when invalid key file is used, halts the scripts from running.
    This error is received by the api and the frontend will display the appropriate error

Functions:
1. __checkNumLiteral__(sample: str):
    - Tests whether the obtained example key from the file can be turned into float
    - True means it is a key for 3D_Cosine
    - False means it is a key for Fisher-Yates

2.  def validateKey(sample: str, mode: EncryptionMode):
    - Tests whether the key is approriate for the selected EncryptionMode
    - Raises an error if incompatible

Code Author: John Paul M. Beltran
"""


from enum import Enum, auto


class EncryptionMode(Enum):
    FISHER_YATES = auto()
    COSINE_3D = auto()


def __checkNumLiteral__(sample: str) -> bool:
    try:
        float(sample)
        return True
    except ValueError:
        return False


def validateKey(sample: str, mode: EncryptionMode) -> None:
    if mode == EncryptionMode.FISHER_YATES:
        if __checkNumLiteral__(sample):
            print("INVALID KEY")
            raise ValueError("INVALID KEY: The key file doesn't work with FY-Logistic decryption")
    elif mode == EncryptionMode.COSINE_3D:
        if not __checkNumLiteral__(sample):
            print("INVALID KEY")
            raise ValueError("INVALID KEY: The key file doesn't work with 3D-Cosine decryption")
    else:
        print("INVALID KEY")
        raise ValueError(f"Unknown key file for mode: {mode}")
