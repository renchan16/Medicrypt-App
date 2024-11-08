"""
The fisher_yates.py contains the script for the proposed study algorithm for video encryption.
This includes both the Encryption and Decryption functions of the algorithm, and as well as key saving.
The script takes parameters for video source and saving filepath and key filepath (encryption and decryption).

Functionality:
--------------
1. Allows encryption/decryption of whole video or a frame only:
    - Whole Video Encryption/Decryption: meant to be used by front-facing/user interacted components
     of the program to encrypt/decrypt and return a video.
    - Frame Encryption/Decryption: Contains the algorithm for encrypting/decrypting a frame which iteratively
     looped by the Video Encryption/Decryption function. Meant to be only interacted by
     the script itself or analysis scripts; returns only a numpy array of a frame.

2. Encryption:
    - Can set 'frame_limit' parameter to encrypt only a specified number of frames,
    set to -1 to disable limits, ONLY USED FOR TESTING AND DEBUGGING.

3. Decryption:
    - Can set 'mem_only' parameter to disable rewriting of the key file during decryption
    and be saved only to memory, setting this to True allows running decryption function multiple
    times safely in case of interruption of the script or the program mid-execution.

4. Exception handling:
    - Exceptions and assertions throughout the script to avoid silent failure and easier debugging.

5. Verbose logging:
    - Can set 'verbose' parameter to true or false to allow logging to console, also helps debugging
    Logging of execution time per frame to display/output in the analysis.
    Contains Encryption and Decryption of the key file as well.

Code Author: John Paul M. Beltran, Roel C. Castro
"""


import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.utils.key_validator import EncryptionMode
from backend.utils.key_validator import validateKey
from pathlib import Path
from math import ceil
import backend.utils.text_file_encryption as tfe
import numpy as np
import hashlib
import time
import cv2

class Encrypt:
    def __init__(self):
        self.NUM_ROWS = 0
        self.NUM_COLS = 0
        self.NUM_CHANNELS = 3

    # creates a hash from an array, returns a hash str
    def __arrayToHash__(self, array):
        _hash = hashlib.sha512(array.tobytes()).hexdigest()

        return _hash

    # Splits the hash str into for equal parts, returns [str, str, str, str]
    def __splitHash__(self, hash):
        _quarters = len(hash) // 4

        return [hash[i: i + _quarters] for i in range(0, len(hash), _quarters)]

    # Converts the hash str (indicated that it is currently base16) into an int, returns [int, int, int, int]
    def __convertToDecimal__(self, hashes):
        _into_decimal = [int(hash, 16) for hash in hashes]

        return _into_decimal

    # Transforms the decimal value to between 0 and 1 or 3.57 and 4 based on their index, returns [int, int, int, int]
    def __transformDecimal__(self, converted_hashes):
        _transformedHash = []
        for i, decimal in enumerate(converted_hashes):
            if i % 2 == 0:  # Even indices (0, 2)
                _transformedHash.append((float(f"0.{decimal}") * 0.43) + 3.57)
            else:  # Odd indices (1, 3)
                # _transformedHash.append(decimal * (10 ** (-39)))
                _transformedHash.append(float(f"0.{decimal}"))

        return _transformedHash

    # Fisher-Yates shuffle of image rows, returns numpy array
    def __shuffleRow__(self, image, size, x0, r):
        _x = x0
        _x = r * _x * (1 - _x)
        for i in range(size - 1, 0, -1):
            _j = ceil(i * _x)

            image[[i, _j]] = image[[_j, i]]
            _x = r * _x * (1 - _x)

        # Reshape back to original dimensions
        _shuffled_pixels = image.reshape(self.NUM_ROWS, self.NUM_COLS, self.NUM_CHANNELS)

        return _shuffled_pixels

    # Fisher-Yates shuffle of image columns, returns numpy array
    def __shuffleCol__(self, image, size, x0, r):
        _x = x0
        _x = r * _x * (1 - _x)
        for i in range(size - 1, 0, -1):
            _j = ceil(i * _x)

            image[:, [i, _j]] = image[:, [_j, i]]
            _x = r * _x * (1 - _x)

        # Reshape back to original dimensions
        _shuffled_pixels = image.reshape(self.NUM_ROWS, self.NUM_COLS, self.NUM_CHANNELS)

        return _shuffled_pixels

    # Fisher-Yates reverse shuffling of image rows, returns numpy array
    def __unshuffleRow__(self, image, swap_indices):
        for i in range(1, self.NUM_ROWS):
            _u = swap_indices.pop(-1)

            image[[i, _u]] = image[[_u, i]]

        return image

    # Fisher-Yates reverse shuffling of image columns, returns numpy array
    def __unshuffleCol__(self, image, swap_indices):
        for i in range(1, self.NUM_COLS):
            _u = swap_indices.pop(-1)

            image[:, [i, _u]] = image[:, [_u, i]]

        return image

    # Generates swap indices for shuffle reversal, returns [int, int, int, ...., int]
    def __generateSwapIndex__(self, size, x0, r):
        _swap_index = []
        _x = x0

        _x = r * _x * (1 - _x)
        _swap_index.append(_x)
        for i in range(size - 1, 0, -1):
            j = ceil(i * _x)
            _x = r * _x * (1 - _x)
            _swap_index.append(j)

        return _swap_index

    # Generates keystream vector, returns numpy[int16, int16, int16, ..., int16]
    def __generateKeystream__(self, res, x0, r):
        _x = x0
        _ks = [x0]
        # create keystream
        for i in range(2000 + ((res * 3) - 1)):
            _x = r * _x * (1 - _x)
            _ks.append(_x)

        # discard first 2000
        del _ks[:2000]

        # convert into numpy array
        _ks_array = np.array(_ks)

        # produce keystream vector
        _kv = np.floor(_ks_array * 10 ** 16) % 256
        _kv = _kv.astype(dtype="int16")

        return _kv

    # XOR wrapper function, returns numpy[int16, int16, int16, ..., int16]
    def __xor__(self, a, b):
        return np.bitwise_xor(a, b)

    # Encrypts the key file
    def __encryptHashes__(self, hash_filepath, password):
        tfe.encryptFile(hash_filepath, password)

    # Decrypts the key file, returns either [str, str, str, ..., str] or None
    def __decryptHashes__(self, hash_filepath, password, mem_only):
        decrypted = tfe.decryptFile(hash_filepath, password, mem_only=mem_only)

        if mem_only:
            return decrypted.splitlines()  # transform the text into a list with newlines as separator
        else:
            return None

    # Validates if the key is appropriate for the algorithm
    def __validateKeyCompatibility__(self, key_sample):
        validateKey(key_sample, mode=EncryptionMode.FISHER_YATES)

        return

    # Frame Encryption, returns numpy array of the frame
    def encryptFrame(self, frame, verbose=False):
        self.NUM_ROWS, self.NUM_COLS, self.NUM_CHANNELS = frame.shape

        if verbose: print("\tGenerating Logistic Map Seeds")
        _hashed = self.__arrayToHash__(frame)

        _splits = self.__splitHash__(_hashed)
        _converted = self.__convertToDecimal__(_splits)
        _transform = self.__transformDecimal__(
            _converted
        )  # [Logmap1 r, Logmap1 x0, Logmap2 r, Logmap2, x0]
        if verbose: print(f"\tGenerated Logistic Map Seeds: {_transform}")

        # Permutate
        if verbose: print("\tRunning Fisher-Yates Permutation")
        _row_permutated = self.__shuffleRow__(
            frame, self.NUM_ROWS, _transform[1], _transform[0]
        )
        _col_permutated = self.__shuffleCol__(
            _row_permutated, self.NUM_COLS, _transform[1], _transform[0]
        )  # final permutation
        if verbose: print("\tPermutation Done")

        _flatten = _col_permutated.reshape(-1, self.NUM_CHANNELS)

        # Create keystream vector
        if verbose: print("\tCreating Keystream Vector")
        _kv = self.__generateKeystream__(
            self.NUM_ROWS * self.NUM_COLS, _transform[3], _transform[2]
        )
        _kr, _kg, _kb = np.array_split(_kv, 3)  # split keystream into three
        _comb_ks = np.vstack((_kb, _kg, _kr)).T  # this is the 2d array of the keystream
        _uint8_ks = _comb_ks.astype(
            np.uint8
        )  # change to uint8 datatype for correct cv2 data type
        if verbose: print("\tCreated Keystream Vector")

        # _diffuse the pixels
        if verbose: print("\tSplitted Frames and Running Diffusion (XOR)")
        _diffuse = self.__xor__(_flatten, _uint8_ks)
        if verbose: print("\tDiffusion Done and Channels Merged")

        # reshape the array into a required cv2 format
        _diffuse_pixels = _diffuse.reshape(
            self.NUM_ROWS, self.NUM_COLS, self.NUM_CHANNELS
        )

        return _diffuse_pixels, _hashed

    # Frame Decryption, returns numpy array of the frame
    def decryptFrame(self, frame, hash, verbose=False):
        self.NUM_ROWS, self.NUM_COLS, self.NUM_CHANNELS = frame.shape

        if verbose: print("\tGenerating Logistic Map Seeds")
        _splits = self.__splitHash__(hash)
        _converted = self.__convertToDecimal__(_splits)
        _transform = self.__transformDecimal__(
            _converted
        )  # [Logmap1 r, Logmap1 x0, Logmap2 r, Logmap2 x0]
        if verbose: print(f"\tGenerated Logistic Map Seeds: {_transform}")

        # flatten array
        _flatten = frame.reshape(-1, self.NUM_CHANNELS)

        if verbose: print("\tGenerating Keystream Vector")
        # create keystream vector
        _kv = self.__generateKeystream__(
            self.NUM_ROWS * self.NUM_COLS, _transform[3], _transform[2]
        )
        _kr, _kg, _kb = np.array_split(_kv, 3)  # split keystream into three
        _comb_ks = np.vstack((_kb, _kg, _kr)).T  # this is the 2d array of the keystream
        _uint8_ks = _comb_ks.astype(
            np.uint8
        )  # change to uint8 datatype for correct cv2 data type
        if verbose: print("\tGenerated Keystream Vector")

        # _undiffuse the pixels
        if verbose: print("\tSplitted Frames and Running Reverse Diffusion (XOR)")
        _undiffuse = self.__xor__(_flatten, _uint8_ks)

        # rejoin channels into one frame
        _undiffused_frame = _undiffuse.reshape(
            self.NUM_ROWS, self.NUM_COLS, self.NUM_CHANNELS
        )
        if verbose: print("\tReverse Diffusion Done and Channels Merged")

        # generate swap index array for row and column
        if verbose: print("\tGenerate Swap Index Array for Row and Columns")
        _row_swap_indices = self.__generateSwapIndex__(
            self.NUM_ROWS, _transform[1], _transform[0]
        )
        _col_swap_indices = self.__generateSwapIndex__(
            self.NUM_COLS, _transform[1], _transform[0]
        )
        if verbose: print("\tSwap Index Array Generated")

        # unshuffle the undiffused frame, then the unshuffled column frame
        if verbose: print("\tRunning Reverse Fisher-Yates Permutation")
        _col_unshuffled = self.__unshuffleCol__(_undiffused_frame, _col_swap_indices)
        _row_unshuffled = self.__unshuffleRow__(_col_unshuffled, _row_swap_indices)
        if verbose: print("\tReverse Fisher-Yates Permutation Done")

        return _row_unshuffled

    # Encrypts the video, outputs a .avi file encoded in HuffmanYUV, returns [int, int, int, ..., int]
    def encryptVideo(self, filepath, vid_destination, key_destination, password, verbose=False, frame_limit=-1):
        _fpath = Path(filepath)
        _vid_dest = Path(vid_destination)
        _key_dest = Path(key_destination)

        # Record per frame runtime here
        _per_frame_runtime = []

        _cap = cv2.VideoCapture(str(_fpath.resolve()), cv2.CAP_FFMPEG)

        _frame_width = int(_cap.get(3))
        _frame_height = int(_cap.get(4))

        _result = cv2.VideoWriter(
            str(_vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"HFYU"),
            _cap.get(cv2.CAP_PROP_FPS),
            (_frame_width, _frame_height),
        )

        cv2.VideoWriter_fourcc("H", "F", "Y", "U")
        # open the text file that will contain the list of hashes
        _hash_file = open(_key_dest.absolute(), "w")

        _count = 0

        while frame_limit < 0 or _count < frame_limit:
            _start = time.time()
            _grabbed, _frame = _cap.read()

            if not _grabbed:
                break

            if verbose: print(f"[Frame {_count}] Encrypting Frame")
            diffuse_pixels, hashed = self.encryptFrame(_frame, verbose)
            if verbose: print(f"[Frame {_count}]  Frame Encrypted")

            if verbose: print(f"[Frame {_count}] Writing Hash to key text file")
            _hash_file.write(
                hashed + "\n"
            )  # write with newline at the end so every writes will start on new line
            if verbose: print(f"[Frame {_count}] Writing Done")

            if verbose: print(f"[Frame {_count}] Writing Encrypted Frame to video")
            _result.write(diffuse_pixels)
            if verbose: print(f"[Frame {_count}] Writing Done")

            _count += 1

            _stop = time.time()
            _duration = _stop - _start
            _per_frame_runtime.append(_duration)

        _cap.release()
        if verbose: print(f"Video has been encrypted")

        _hash_file.close()  # finally, close the file
        self.__encryptHashes__(
            _key_dest.resolve(), password
        )  # and encrypt the hash file
        if verbose: print(f"Key file has been encrypted")

        return _per_frame_runtime

    # Encrypts the video, outputs a .mp4 file encoded in mp4v, returns [int, int, int, ..., int]
    def decryptVideo(self, filepath, vid_destination, hash_filepath, password, verbose=False, mem_only=True):
        _fpath = Path(filepath)
        _vid_dest = Path(vid_destination)
        _key = Path(hash_filepath)

        # Record per frame runtime here
        _per_frame_runtime = []

        _key_list = self.__decryptHashes__(_key.resolve(), password, mem_only=mem_only)
        if verbose: print("Decrypted the Key Hash File")

        if mem_only:
            _lines = _key_list
        else:
            _hash_file = open(_key.resolve(), "r")
            _lines = _hash_file.readlines()

        self.__validateKeyCompatibility__(_lines[0])  # validate first if we are working with compatible key file

        _cap = cv2.VideoCapture(str(_fpath.resolve()), cv2.CAP_FFMPEG)

        _frame_width = int(_cap.get(3))
        _frame_height = int(_cap.get(4))

        _result = cv2.VideoWriter(
            str(_vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"mp4v"),
            _cap.get(cv2.CAP_PROP_FPS),
            (_frame_width, _frame_height),
        )

        _hash_line = 0  # keep track of our line in the text file

        _count = 0

        while True:
            _start = time.time()
            _grabbed, _frame = _cap.read()

            if not _grabbed:
                break

            if verbose: print(f"[Frame {_count}] Grabbing the Hash for Frame {_count}")
            _hashed = _lines[_hash_line].rstrip()

            # Decrypt
            if verbose: print(f"[Frame {_count}] Decrypting Frame")
            _row_unshuffled = self.decryptFrame(_frame, _hashed)
            if verbose: print(f"[Frame {_count}] Frame Decrypted")

            if verbose: print(f"[Frame {_count}] Writing Decrypted Frame to video")
            _result.write(_row_unshuffled)
            if verbose: print(f"[Frame {_count}] Writing Done")

            _count += 1
            _hash_line += 1

            _stop = time.time()
            _duration = _stop - _start
            _per_frame_runtime.append(_duration)

        _cap.release()
        if verbose: print(f"Video has been Decrypted")

        if not mem_only:
            self.__encryptHashes__(_key.resolve(), password)     # re-encrypt file for safety
            _hash_file.close()   # finally, close the file

        return _per_frame_runtime
