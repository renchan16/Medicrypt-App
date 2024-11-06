import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.utils.key_validator import EncryptionMode
from backend.utils.key_validator import validateKey
from pathlib import Path
import backend.utils.text_file_encryption as tfe
import numpy as np
import warnings
import hashlib
import struct
import shutil
import time
import math
import cv2
import os


class Encrypt_cosine:
    def __init__(self):
        self.N = 2.24  # n = [0, 4)
        self.OMEGA = 34.2  # omega > 33.5
        self.THETA = 38.23  # theta > 37.9
        self.KAPPA = 36.79  # kappa > 35.7

    def _decomposeFrame__(self, filepath, temp_path, preserveColor=False):
        if not os.path.isdir(temp_path):
            os.makedirs(temp_path)

            # Path to video file
            _vidObj = cv2.VideoCapture(filepath)

            # Used as counter variable
            _count = 0

            # checks whether frames were extracted
            _success = 1

            if not preserveColor:
                while _success:
                    # _vidObj object calls read
                    # function extract frames
                    _success, _image = _vidObj.read()

                    if _success:
                        # Saves the frames with frame-count
                        cv2.imwrite(f"{temp_path}/frame_%d.jpg" % _count, _image)

                        _count += 1

                    else:
                        break

            else:
                while _success:
                    # _vidObj object calls read
                    # function extract frames
                    _success, _image = _vidObj.read()

                    if _success:
                        # Saves the frames with frame-count
                        cv2.imwrite(f"{temp_path}/frame_%d.png" % _count, _image, [cv2.IMWRITE_PNG_COMPRESSION, 0])

                        _count += 1

                    else:
                        break
        else:
            raise Exception(f"Conflicting file directory for path: {temp_path} already exists")

    def __binaryToHash__(self, binary_array):
        _hashes = []
        for binary_data in binary_array:
            _sha256 = hashlib.sha256()
            _sha256.update(binary_data)
            _hashes.append(_sha256.hexdigest())
        return _hashes

    def __generateSeed__(self, key_length):
        _secret_key = np.random.random_sample(key_length, )
        _secret_key_binaries = np.array([struct.pack('>d', num) for num in _secret_key], dtype=object)
        _key_matrix = self.__binaryToHash__(_secret_key_binaries)
        _key_matrix_float = np.array([int(key, 16) for key in _key_matrix])

        _a = 0
        _sum = 0

        for i in range(key_length // 2):
            _a ^= _key_matrix_float[i]

        for gap in range(key_length // 2, key_length):
            _sum += int(_key_matrix_float[gap])

        _seed = _a + _sum
        _seed /= 2 ** 12

        return _seed

    def __generateILMSequence__(self, length, S):
        A1 = self.N * self.OMEGA
        A2 = self.N * self.THETA
        B1 = self.N
        B2 = self.KAPPA
        ILM = S

        _ilm_sequence = []

        for c in range(length):
            ILM0 = (A1 * S * (1 - S) + S) % 1
            ILM1 = ((A2 * S) + (S * 1 / (1 + ILM0 ** 2))) % 1
            ILM2 = (B1 * (ILM0 + ILM1 + B2) * np.sin(S)) % 1
            S = ILM

            ILM = ILM0 + ILM1 + ILM2
            _ilm_sequence.append(ILM)

        # Convert ilm_sequence to a numpy array
        _ilm_seq_np = np.array(_ilm_sequence)

        # Calculate cosine of pi times each element in ilm_seq_np
        _ilm_cos = np.cos(np.pi * _ilm_seq_np)

        return _ilm_cos

    def __generateSequence__(self, hash_length, block_size):
        # Generate 3D seed
        _seed = self.__generateSeed__(hash_length)

        # Generate ILM-cosine sequence
        _cos_ilm_sequence = self.__generateILMSequence__(block_size, _seed)

        return _seed, _cos_ilm_sequence

    def __permutate__(self, block_size, block_matrix, channel, In_P, In_Q, In_R, In_S, mode='permute'):
        assert mode == 'permute' or mode == 'antipermute', "Mode must be 'permute' or 'antipermute'"

        # Copy the gray component
        _scrambled_img = channel.copy()

        # Initialize L and M matrices
        L = np.zeros((block_matrix, block_matrix))
        M = np.zeros((block_matrix, block_matrix))

        In_Q.tolist()
        In_S.tolist()

        for y in range(1, block_matrix + 1):
            for x in range(1, block_matrix + 1):
                C = (x + In_Q[y - 1] - 1) % (block_matrix + 1)
                D = (x + In_S[y - 1] - 1) % (block_matrix + 1)

                L[x - 1, y - 1] = In_P[C - 1]
                M[x - 1, y - 1] = In_R[D - 1]

        if mode == 'permute':
            for x in range(1, block_matrix + 1):
                for y in range(1, block_matrix + 1):
                    I = int(L[x - 1, y - 1])
                    J = int(M[I - 1, y - 1])

                    C1 = (I - 1) // block_size
                    D1 = (I - 1) % block_size

                    C2 = (J - 1) // block_size + 1
                    D2 = (J - 1) % block_size + 1

                    R = C1 * block_size + C2
                    C = D1 * block_size + D2

                    # Swap pixels (x, y) and (r, c)
                    _temp = _scrambled_img[R, C].copy()  # Store (r, c) pixel temporarily
                    _scrambled_img[R, C] = _scrambled_img[x, y]  # Move (x, y) to (r, c)
                    _scrambled_img[x, y] = _temp  # Put the old (r, c) pixel into (x, y)
        else:
            for x in range(block_matrix, 0, -1):
                for y in range(block_matrix, 0, -1):
                    I = int(L[x - 1, y - 1])
                    J = int(M[I - 1, y - 1])

                    C1 = (I - 1) // block_size
                    D1 = (I - 1) % block_size

                    C2 = (J - 1) // block_size + 1
                    D2 = (J - 1) % block_size + 1

                    R = C1 * block_size + C2
                    C = D1 * block_size + D2

                    # Swap pixels (x, y) and (r, c)
                    _temp = _scrambled_img[R, C].copy()  # Store (r, c) pixel temporarily
                    _scrambled_img[R, C] = _scrambled_img[x, y]  # Move (x, y) to (r, c)
                    _scrambled_img[x, y] = _temp  # Put the old (r, c) pixel into (x, y)

        return _scrambled_img

    def __diffuse__(self, seq_2d, channel, mode='diffuse'):
        assert mode in ['diffuse', 'antidiffuse'], "Mode must be 'diffuse' or 'antidiffuse'"

        _m, _n = channel.shape
        _mod = 256  # modulo for 8-bit grayscale image

        _A = np.rot90(seq_2d, k=-1)  # rotate clockwise
        _In_A = np.argsort(_A.flatten())  # Get index sequence of A
        _B = np.rot90(_In_A.reshape(_n, _m), k=-1)  # rotate clockwise
        print("Generated Substitution Sequence")

        _diffused_img = np.zeros_like(channel)

        # flatten the required arrays and cast to float64 to avoid overflow
        _A_flat = _A.flatten().astype('float64')
        _ch_flat = channel.flatten().astype('float64')
        _diff_flat = _diffused_img.flatten().astype('float64')

        if mode == 'diffuse':
            for _row in range(_m):
                for _col in range(_n):
                    _i = _row * _n + _col
                    if _i == 0:
                        _diff_flat[_B[_row, _col]] = (_ch_flat[_B[_row, _col]] +
                                                      _ch_flat[_B[_m - 1, _n - 1]] +
                                                    2 ** 32 * _A_flat[_B[_row, _col]]) % _mod
                    elif _col == 0:
                        _prev_row, _prev_col = divmod(_i - 1, _n)
                        _diff_flat[_B[_row, _col]] = (_ch_flat[_B[_row, _col]] +
                                                    _diff_flat[_B[_row - 1, _prev_col]] +
                                                    2 ** 32 * _A_flat[_B[_row, _col]]) % _mod
                    else:
                        _diff_flat[_B[_row, _col]] = (_ch_flat[_B[_row, _col]] +
                                                    _diff_flat[_B[_row, _col - 1]] +
                                                    2 ** 32 * _A_flat[_B[_row, _col]]) % _mod
        else: 
            for _r in range(_m):
                for _c in range(_n):
                    if _c == 0:
                        _prev_c = _n - 1
                        _prev_r = _r - 1 if _r > 0 else _m - 1
                    else:
                        _prev_c = _c - 1
                        _prev_r = _r

                    # Perform antidiffusion
                    _diff_flat[_B[_r, _c]] = (_mod + _ch_flat[_B[_r, _c]] - 
                                            _ch_flat[_B[_prev_r, _prev_c]] - 
                                            2**32 * _A_flat[_B[_r, _c]]) % _mod
                    
            _c = 0
            for _r in range(1, _n):
                _diff_flat[_B[_r, _c]] = (_mod + _ch_flat[_B[_r, _c]] - 
                                        _ch_flat[_B[_r - 1, _n - 1]] - 
                                        2**32 * _A_flat[_B[_r, _c]]) % _mod

        _final_diffuse = _diff_flat.reshape(_m, _n).astype('uint8')

        return _final_diffuse

    def __generateFrameSequence__(self, num_frames):
        return np.random.permutation(num_frames).tolist()

    def __encryptKey__(self, hash_filepath, password):
        tfe.encryptFile(hash_filepath, password)

    def __decryptKey__(self, hash_filepath, password, mem_only):
        _decrypted = tfe.decryptFile(hash_filepath, password, mem_only=mem_only)

        if mem_only:
            _key_list = _decrypted.splitlines()

            self.__validateKeyCompatibility__(_key_list[0])  # validate first if we are working with compatible key file

            _frame_seq = eval(_key_list.pop())

            return _key_list, _frame_seq
        else:
            return None, None

    def __validateKeyCompatibility__(self, key_sample):
        validateKey(key_sample, mode=EncryptionMode.COSINE_3D)

        return

    def encryptFrame(self, frame, verbose=False):
        _blue, _green, _red = cv2.split(frame)  # cv2 always read in BGR mode
        if verbose: print("\tSplitted Frame into RGB channels")

        # Permutation
        _height, _width, _channels = frame.shape

        _block_size = min(math.floor(math.sqrt(_height)), math.floor(math.sqrt(_width)))
        _block_matrix = _block_size * _block_size

        if verbose: print("\tGenerating ILM-Cosine Sequence")
        _perm_seed, _cos_ilm_sequence = self.__generateSequence__(360, 4 * _block_matrix)
        if verbose: print("\tILM-Cosine Sequence Generated")

        P, Q, R, S = np.split(_cos_ilm_sequence, 4)

        # Sort enumerated matrix
        In_P = np.argsort(P)
        In_Q = np.argsort(Q)
        In_R = np.argsort(R)
        In_S = np.argsort(S)

        if verbose: print("\tRunning Permutation(Scrambling) on all color channels")
        _blue_scrambled = self.__permutate__(_block_size, _block_matrix, _blue, In_P, In_Q, In_R, In_S)
        _green_scrambled = self.__permutate__(_block_size, _block_matrix, _green, In_P, In_Q, In_R, In_S)
        _red_scrambled = self.__permutate__(_block_size, _block_matrix, _red, In_P, In_Q, In_R, In_S)
        if verbose: print("\tAll color channels has been permutated")

        # Rotate 90
        _rot90_blue = np.rot90(_blue_scrambled)
        _rot90_green = np.rot90(_green_scrambled)
        _rot90_red = np.rot90(_red_scrambled)
        if verbose: print("\tAll color channels has been rotated 90 degrees anticlockwise")

        # Diffusion
        _diff_seed, _cos_ilm_sequence = self.__generateSequence__(360, _height * _width)
        _cos_ilm_seq2D = _cos_ilm_sequence.reshape(_height, _width)

        if verbose: print("\tRunning Diffusion(Random Order Substitution) on all color channels")
        _blue_diffuse = self.__diffuse__(_cos_ilm_seq2D, _rot90_blue)
        _green_diffuse = self.__diffuse__(_cos_ilm_seq2D, _rot90_green)
        _red_diffuse = self.__diffuse__(_cos_ilm_seq2D, _rot90_red)
        if verbose: print("\tAll color channels has been diffused")

        # Merge all channels for final encrypted frame
        _merged_img = cv2.merge([_blue_diffuse, _green_diffuse, _red_diffuse])  # merge in BGR mode
        if verbose: print("\tAll color channels have been merged")

        return _merged_img, _perm_seed, _diff_seed

    def decryptFrame(self, frame, perm_seed, diff_seed, verbose=False):
        _height, _width, _channels = frame.shape
        _blue, _green, _red = cv2.split(frame)
        if verbose: print("Splitted Frame into RGB channels")

        # Anti-Diffusion
        if verbose: print("Running Anti-Substitution(Random Order Substitution) on all color channels")
        _cos_ilm_sequence = self.__generateILMSequence__(_height * _width, diff_seed)
        _cos_ilm_seq2D = _cos_ilm_sequence.reshape(_width, _height)

        _blue_antidiffused = self.__diffuse__(_cos_ilm_seq2D, _blue, mode='antidiffuse')
        _green_antidiffused = self.__diffuse__(_cos_ilm_seq2D, _green, mode='antidiffuse')
        _red_antidiffused = self.__diffuse__(_cos_ilm_seq2D, _red, mode='antidiffuse')
        if verbose: print("All color channels has been anti-substituted")

        # Rotate 270
        _rot270_blue = np.rot90(_blue_antidiffused, 3)
        _rot270_green = np.rot90(_green_antidiffused, 3)
        _rot270_red = np.rot90(_red_antidiffused, 3)
        if verbose: print("All color channels has been rotated 270 degrees anticlockwise")

        # since frames are same sizes, sample a channel for new rotated h,w
        _new_height, _new_width = _rot270_blue.shape

        # Permutate
        _block_size = min(math.floor(math.sqrt(_new_height)), math.floor(math.sqrt(_new_width)))
        _block_matrix = _block_size * _block_size

        if verbose: print("Generating ILM-Cosine Sequence")
        _cos_ilm_sequence = self.__generateILMSequence__(4 * _block_matrix, perm_seed)
        if verbose: print("ILM-Cosine Sequence Generated")

        P, Q, R, S = np.split(_cos_ilm_sequence, 4)

        # Sort enumerated matrix and return index 0
        In_P = np.argsort(P)
        In_Q = np.argsort(Q)
        In_R = np.argsort(R)
        In_S = np.argsort(S)

        if verbose: print("Running De-Permutation on all color channels")
        _blue_scrambled = self.__permutate__(_block_size, _block_matrix, _rot270_blue,
                                             In_P, In_Q, In_R, In_S,
                                             mode='antipermute')
        _green_scrambled = self.__permutate__(_block_size, _block_matrix, _rot270_green,
                                              In_P, In_Q, In_R, In_S,
                                              mode='antipermute')
        _red_scrambled = self.__permutate__(_block_size, _block_matrix, _rot270_red,
                                            In_P, In_Q, In_R, In_S,
                                            mode='antipermute')
        if verbose: print("All color channels has been de-permutated")

        # Merge all channels for final decrypted frame
        _merged_img = cv2.merge([_blue_scrambled, _green_scrambled, _red_scrambled])  # merge in BGR mode
        if verbose: print("All color channels have been merged")

        return _merged_img

    def encryptVideo(self, filepath, vid_destination, key_destination, password, verbose=False, frame_limit=-1):
        _fpath = Path(filepath)
        _vid_dest = Path(vid_destination)
        _key_dest = Path(key_destination)
        _key_file = open(_key_dest.absolute(), "w")

        # Record per frame runtime here
        _per_frame_runtime = []

        # Prepare the video writer
        _cap = cv2.VideoCapture(str(_fpath.resolve()), cv2.CAP_FFMPEG)

        _frame_width = int(_cap.get(3))
        _frame_height = int(_cap.get(4))

        _result = cv2.VideoWriter(
            str(_vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"HFYU"),
            _cap.get(cv2.CAP_PROP_FPS),
            (_frame_height, _frame_width),  # we use height, width as the final encryption is rotated 90 degrees
        )

        # Extract frames
        _temp_path = os.path.join(os.path.dirname(filepath),
                                  'frameGen_temp')  # make temp folder in the same path as the video

        if verbose: print(f"Extracting and Dumping Frames to {_temp_path} as .jpg")
        self._decomposeFrame__(filepath, _temp_path)
        if verbose: print(f"All frames has been Extracted")

        # Get a sorted list of all the frame filenames in the folder
        _frame_filenames = sorted([f for f in os.listdir(_temp_path) if f.endswith('.jpg')])
        _sorted_frames = sorted(_frame_filenames, key=lambda x: int(x.split('_')[1].split('.')[0]))

        _temp_encryption_path = os.path.join(_temp_path, 'encryption_temp')
        os.makedirs(_temp_encryption_path)
        for count, curr_frame in enumerate(_sorted_frames[:frame_limit if frame_limit > -1 else None]):
            _start = time.time()

            _frame_name = os.path.join(_temp_path, curr_frame)

            _frame = cv2.imread(_frame_name)

            if verbose: print(f"[Frame {count}] Encrypting {curr_frame}")
            _merged_img, _perm_seed, _diff_seed = self.encryptFrame(_frame, verbose)
            if verbose: print(f"[Frame {count}] Frame Encrypted")

            # Save encrypted image to another temp path
            if verbose: print(f"[Frame {count}] Saving Encrypted Frame to {_temp_encryption_path}")
            _no_extension = os.path.splitext(curr_frame)[0]
            cv2.imwrite(f"{_temp_encryption_path}/{_no_extension}.png", _merged_img, [cv2.IMWRITE_PNG_COMPRESSION, 0])
            if verbose: print(f"[Frame {count}] Encrypted Frame has been saved")

            # Save the permutation and diffusion seeds
            _key_file.write(str(_perm_seed) + "\n")
            _key_file.write(str(_diff_seed) + "\n")

            _stop = time.time()
            _duration = _stop - _start
            _per_frame_runtime.append(_duration)

        # Generate Frame Selection sequence
        _all_encrypted_frames = [f for f in os.listdir(_temp_encryption_path) if f.endswith('.png')]
        _frame_sequence = self.__generateFrameSequence__(len(_all_encrypted_frames))
        if verbose: print("Frame Sequence has been generated")

        # Write to video writer with Frame Selection sequence
        if verbose: print("Writing encrypted frames to Video according to Frame Sequence")
        for frame_no in _frame_sequence:
            _result.write(cv2.imread(f"{_temp_encryption_path}/frame_{frame_no}.png"))

        # Once Done, write the sequence into the key file
        _key_file.write(str(_frame_sequence))

        _cap.release()
        if verbose: print("Video Writing Done and Video has been encrypted")
        _key_file.close()
        self.__encryptKey__(_key_dest.resolve(), password)

        if os.path.isdir(_temp_path):
            shutil.rmtree(_temp_path)  # delete the temp_path and its contents
        else:
            _text_warn = f"{_temp_path} could not be found: Path could be either moved or deleted, please make sure it " \
                         f"is completely gone from your files"
            warnings.warn(_text_warn, Warning)

        return _per_frame_runtime

    def decryptVideo(self, filepath, vid_destination, key_filepath, password, verbose=False, mem_only=True):
        _fpath = Path(filepath)
        _vid_dest = Path(vid_destination)
        _key = Path(key_filepath)

        # Record per frame runtime here
        _per_frame_runtime = []

        _keys, _frame_sequence = self.__decryptKey__(_key.resolve(), password, mem_only=mem_only)

        if mem_only:
            _lines = _keys
            _frame_select_seq = _frame_sequence
        else:
            _key_file = open(_key.resolve(), "r")
            _lines = _key_file.readlines()

            # Get the Frame Selection sequence in the last line of the key file
            _frame_sequence = _lines[-1]

            # Convert the string back to list
            _frame_select_seq = eval(_frame_sequence)

            self.__validateKeyCompatibility__(_lines[0])  # validate first if we are working with compatible key file

        # Prepare the video writer
        _cap = cv2.VideoCapture(str(_fpath.resolve()), cv2.CAP_FFMPEG)

        _frame_width = int(_cap.get(3))
        _frame_height = int(_cap.get(4))

        _result = cv2.VideoWriter(
            str(_vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"mp4v"),
            _cap.get(cv2.CAP_PROP_FPS),
            (_frame_height, _frame_width),  # we use h, w again as the final decryption is rotated back to normal
        )

        # Extract frames
        _temp_path = os.path.join(os.path.dirname(filepath),
                                  'frameGen_temp')  # make temp folder in the same path as the video

        if verbose: print(f"Extracting and Dumping Frames to {_temp_path} as .png")
        self._decomposeFrame__(filepath, _temp_path, True)
        if verbose: print(f"All frames has been Extracted")

        _frame_filenames = sorted([f for f in os.listdir(_temp_path) if f.endswith('.png')])
        _sorted_frames = sorted(_frame_filenames, key=lambda x: int(x.split('_')[1].split('.')[0]))

        # Create a temp folder where deshuffled frames are moved then renaming them
        _temp_fs_path = os.path.join(_temp_path, 'fs_temp')
        os.makedirs(_temp_fs_path)

        # rearrange the frames according the Frame Selection sequence
        if verbose: print(f"Rearranging and Renaming the frames to {_temp_fs_path}")
        for inx, curr_frame in enumerate(_sorted_frames):
            _source = os.path.join(_temp_path, curr_frame)
            _dest = os.path.join(_temp_fs_path, f"frame_{_frame_select_seq[inx]}.png")
            shutil.move(_source, _dest)
        if verbose: print(f"All frames has been rearranged and renamed")

        # sort the arranged frames again in the array to be decrypted
        _new_frame_filenames = sorted([f for f in os.listdir(_temp_fs_path) if f.endswith('.png')])
        _new_sorted_frames = sorted(_new_frame_filenames, key=lambda x: int(x.split('_')[1].split('.')[0]))

        for inx, curr_frame in enumerate(_new_sorted_frames):
            _start = time.time()

            _frame_name = os.path.join(_temp_fs_path, curr_frame)

            _frame = cv2.imread(_frame_name)

            _start_inx = inx * 2
            _perm_seed = float(_lines[_start_inx].rstrip())
            _diff_seed = float(_lines[_start_inx + 1].rstrip())

            if verbose: print(f"[Frame {inx}]: Decrypting {curr_frame}")
            _merged_img = self.decryptFrame(_frame, _perm_seed, _diff_seed)
            if verbose: print(f"[Frame {inx}]: Frame Decrypted")

            if verbose: print(f"[Frame {inx}]: Writing Decrypted frame to video")
            _result.write(_merged_img)
            if verbose: print(f"[Frame {inx}]: Writing Done")

            stop = time.time()
            duration = stop - _start
            _per_frame_runtime.append(duration)

        _cap.release()
        if verbose: print("Video has been decrypted")

        if not mem_only:
            self.__encryptKey__(_key.resolve(), password)  # re-encrypt file for safety
            _key_file.close()  # finally, close the file

        if os.path.isdir(_temp_path):
            shutil.rmtree(_temp_path)  # delete the temp_path and its contents
        else:
            _text_warn = f"{_temp_path} could not be found: Path could be either moved or deleted, please make sure " \
                         f"it is completely gone from your files"
            warnings.warn(_text_warn, Warning)

        return _per_frame_runtime


if __name__ == '__main__':
    e = Encrypt_cosine()
    src = r'C:\Users\Lenovo\Documents\GitHub\Medicrypt-App\tests\test388.jpg'
    frame = cv2.imread(src)
    enc, _, _ = e.encryptFrame(frame)

    cv2.imshow('e', enc)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    # e.encryptVideo(r'C:\Users\Lenovo\Documents\GitHub\Medicrypt-App\tests\test.mp4')
