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
