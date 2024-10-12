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
            raise ValueError("Invalid key for Fisher-Yates mode: must be non-numeric")
    elif mode == EncryptionMode.COSINE_3D:
        if not __checkNumLiteral__(sample):
            raise ValueError("Invalid key for 3D Cosine mode: must be numeric")
    else:
        raise ValueError(f"Unknown encryption mode: {mode}")
