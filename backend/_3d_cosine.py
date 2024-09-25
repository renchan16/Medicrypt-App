from Crypto.Protocol.KDF import PBKDF2
from Crypto.Cipher import AES
from pathlib import Path
import numpy as np
import hashlib
import struct
import shutil
import time
import math
import cv2
import os


class Encrypt_cosine:
    def __init__(self):
        self.salt = b"\xb8O\xde/\xbc\x9b\\/w\x18%&]&\x0e{\x08\xb9\xfa\xe1T\x8fZ\xc8'\xb25Z\x12\x1b\xb2\x80"
        self.nonce = b"\xddR\x05#c\xdd\xe3\xcd\x10\x14kWv\x89\xdb[\xf4\x06j \xe8\x97S;\xa6\x14\xdc-\xae\x16@l"

        self.n = 2.24  # n = [0, 4)
        self.o = 34.2  # omega > 33.5
        self.t = 38.23  # theta > 37.9
        self.k = 36.79  # kappa > 35.7

    def __frameGen__(self, filepath, temp_path, preserveColor=False):
        if not os.path.isdir(temp_path):
            os.makedirs(temp_path)

            # Path to video file
            vidObj = cv2.VideoCapture(filepath)

            # Used as counter variable
            count = 0

            # checks whether frames were extracted
            success = 1

            if not preserveColor:
                while success:
                    # vidObj object calls read
                    # function extract frames
                    success, image = vidObj.read()

                    if success:
                        # Saves the frames with frame-count
                        cv2.imwrite(f"{temp_path}/frame_%d.jpg" % count, image)

                        count += 1

                    else:
                        break

            else:
                print("preserve color")
                while success:
                    # vidObj object calls read
                    # function extract frames
                    success, image = vidObj.read()

                    if success:
                        # Saves the frames with frame-count
                        cv2.imwrite(f"{temp_path}/frame_%d.png" % count, image, [cv2.IMWRITE_PNG_COMPRESSION, 0])

                        count += 1

                    else:
                        break
        else:
            raise Exception(f"Conflicting file directory for path: {temp_path} already exists")

    def __binaryHash__(self, binary_array):
        hashes = []
        for binary_data in binary_array:
            sha256 = hashlib.sha256()
            sha256.update(binary_data)
            hashes.append(sha256.hexdigest())
        return hashes

    def __seedGen__(self, key_length):
        secret_key = np.random.random_sample(key_length, )
        secret_key_binaries = np.array([struct.pack('>d', num) for num in secret_key], dtype=object)
        key_matrix = self.__binaryHash__(secret_key_binaries)
        key_matrix_float = np.array([int(key, 16) for key in key_matrix])

        a = 0
        sum = 0

        for i in range(key_length // 2):
            a ^= key_matrix_float[i]

        for gap in range(key_length // 2, key_length):
            sum += int(key_matrix_float[gap])

        seed = a + sum
        seed /= 2 ** 12

        return seed

    def __ILMGen__(self, length, S):
        a1 = self.n * self.o
        a2 = self.n * self.t
        b1 = self.n
        b2 = self.k
        ILM = S

        ilm_sequence = []

        for c in range(length):
            ILM0 = (a1 * S * (1 - S) + S) % 1
            ILM1 = ((a2 * S) + (S * 1 / (1 + ILM0 ** 2))) % 1
            ILM2 = (b1 * (ILM0 + ILM1 + b2) * np.sin(S)) % 1
            S = ILM

            ILM = ILM0 + ILM1 + ILM2
            ilm_sequence.append(ILM)

        # Convert ilm_sequence to a numpy array
        ilm_seq_np = np.array(ilm_sequence)

        # Calculate cosine of pi times each element in ilm_seq_np
        ilm_cos = np.cos(np.pi * ilm_seq_np)

        return ilm_cos

    def __sequenceGen__(self, hash_length, block_size):
        # Generate 3D seed
        seed = self.__seedGen__(hash_length)

        # Generate ILM-cosine sequence
        cos_ilm_sequence = self.__ILMGen__(block_size, seed)

        return seed, cos_ilm_sequence

    def __permutate__(self, block_size, block_matrix, channel, In_P, In_Q, In_R, In_S, mode='permute'):
        assert mode == 'permute' or mode == 'antipermute', "Mode must be 'permute' or 'antipermute'"

        # Copy the gray component
        scrambled_img = channel.copy()

        # Initialize L and M matrices
        L = np.zeros((block_matrix, block_matrix))
        M = np.zeros((block_matrix, block_matrix))

        In_Q.tolist()
        In_S.tolist()

        for y in range(1, block_matrix + 1):
            for x in range(1, block_matrix + 1):
                c = (x + In_Q[y - 1] - 1) % (block_matrix + 1)
                d = (x + In_S[y - 1] - 1) % (block_matrix + 1)

                L[x - 1, y - 1] = In_P[c - 1]
                M[x - 1, y - 1] = In_R[d - 1]

        if mode == 'permute':
            for x in range(1, block_matrix + 1):
                for y in range(1, block_matrix + 1):
                    i = int(L[x - 1, y - 1])
                    j = int(M[i - 1, y - 1])

                    c1 = (i - 1) // block_size
                    d1 = (i - 1) % block_size

                    c2 = (j - 1) // block_size + 1
                    d2 = (j - 1) % block_size + 1

                    r = c1 * block_size + c2
                    c = d1 * block_size + d2

                    # Swap pixels (x, y) and (r, c)
                    temp = scrambled_img[r, c].copy()  # Store (r, c) pixel temporarily
                    scrambled_img[r, c] = scrambled_img[x, y]  # Move (x, y) to (r, c)
                    scrambled_img[x, y] = temp  # Put the old (r, c) pixel into (x, y)
        else:
            for x in range(block_matrix, 0, -1):
                for y in range(block_matrix, 0, -1):
                    i = int(L[x - 1, y - 1])
                    j = int(M[i - 1, y - 1])

                    c1 = (i - 1) // block_size
                    d1 = (i - 1) % block_size

                    c2 = (j - 1) // block_size + 1
                    d2 = (j - 1) % block_size + 1

                    r = c1 * block_size + c2
                    c = d1 * block_size + d2

                    # Swap pixels (x, y) and (r, c)
                    temp = scrambled_img[r, c].copy()  # Store (r, c) pixel temporarily
                    scrambled_img[r, c] = scrambled_img[x, y]  # Move (x, y) to (r, c)
                    scrambled_img[x, y] = temp  # Put the old (r, c) pixel into (x, y)

        return scrambled_img

    def __diffuse__(self, seq_2d, channel, mode='diffuse'):
        assert mode == 'diffuse' or mode == 'antidiffuse', "Mode must be 'diffuse' or 'antidiffuse'"

        m, n = channel.shape
        M = 256  # modulo for 8-bit grayscale image

        A = np.rot90(seq_2d, k=-1)  # rotate clockwise

        In_A = np.argsort(A.flatten())  # Get index sequence of A

        B = np.rot90(In_A.reshape(n, m), k=-1)  # rotate clockwise

        diffused_img = np.zeros_like(channel)

        # flatten the required arrays and cast to float64 to avoid overflow
        A_flat = A.flatten().astype('float64')
        ch_flat = channel.flatten().astype('float64')
        diff_flat = diffused_img.flatten().astype('float64')

        if mode == 'diffuse':
            for row in range(m):
                for col in range(n):
                    if row == 0 and col == 0:
                        diff_flat[B[row, col]] = (ch_flat[B[row, col]] +
                                                  ch_flat[B[m - 1, n - 1]] +
                                                  2 ** 32 * A_flat[B[row, col]]) % M
                    elif col == 0:
                        diff_flat[B[row, col]] = (ch_flat[B[row, col]] +
                                                  diff_flat[B[row - 1, n - 1]] +
                                                  2 ** 32 * A_flat[B[row, col]]) % M
                    else:
                        diff_flat[B[row, col]] = (ch_flat[B[row, col]] +
                                                  diff_flat[B[row, col - 1]] +
                                                  2 ** 32 * A_flat[B[row, col]]) % M
        else:
            # Loop through rows
            for r in range(m):
                for c in range(n):
                    diff_flat[B[r, c]] = (M + ch_flat[B[r, c]] -
                                          ch_flat[B[r, c - 1]] -
                                          2 ** 32 * A_flat[B[r, c]]) % M

            # Loop through columns
            c = 0
            for r in range(1, n):
                diff_flat[B[r, c]] = (M + ch_flat[B[r, c]] -
                                      ch_flat[B[r - 1, n - 1]] -
                                      2 ** 32 * A_flat[B[r, c]]) % M

        final_diffuse = diff_flat.reshape(m, n).astype('uint8')  # reshape back to 2d and cast to appropriate dtype

        return final_diffuse

    def __frameSeqGen__(self, num_frames):
        return np.random.permutation(num_frames).tolist()

    def __encryptKey__(self, hash_filepath, password):
        key = PBKDF2(password, self.salt, dkLen=32)
        cipher = AES.new(key, AES.MODE_GCM, nonce=self.nonce)

        with open(hash_filepath, "rb") as file:
            plain = file.read()

        ciphertext = cipher.encrypt(plain)

        with open(hash_filepath, "wb") as enc_file:
            enc_file.write(ciphertext)

    def __decryptKey__(self, hash_filepath, password):
        key = PBKDF2(password, self.salt, dkLen=32)
        cipher = AES.new(key, AES.MODE_GCM, nonce=self.nonce)

        with open(hash_filepath, "rb") as enc_file:
            encrypted = enc_file.read()

        plaintext = cipher.decrypt(encrypted)

        with open(hash_filepath, "wb") as file:
            file.write(plaintext)

    def encryptFrame(self, frame):
        blue, green, red = cv2.split(frame)  # cv2 always read in BGR mode

        # Permutation
        height, width, channels = frame.shape

        block_size = min(math.floor(math.sqrt(height)), math.floor(math.sqrt(width)))
        block_matrix = block_size * block_size

        perm_seed, cos_ilm_sequence = self.__sequenceGen__(360, 4 * block_matrix)

        P, Q, R, S = np.split(cos_ilm_sequence, 4)

        # Sort enumerated matrix
        In_P = np.argsort(P)
        In_Q = np.argsort(Q)
        In_R = np.argsort(R)
        In_S = np.argsort(S)

        blue_scrambled = self.__permutate__(block_size, block_matrix, blue, In_P, In_Q, In_R, In_S)
        green_scrambled = self.__permutate__(block_size, block_matrix, green, In_P, In_Q, In_R, In_S)
        red_scrambled = self.__permutate__(block_size, block_matrix, red, In_P, In_Q, In_R, In_S)

        # Rotate 90
        rot90_blue = np.rot90(blue_scrambled)
        rot90_green = np.rot90(green_scrambled)
        rot90_red = np.rot90(red_scrambled)

        # Diffusion
        diff_seed, cos_ilm_sequence = self.__sequenceGen__(360, height * width)
        cos_ilm_seq2D = cos_ilm_sequence.reshape(height, width)

        blue_diffuse = self.__diffuse__(cos_ilm_seq2D, rot90_blue)
        green_diffuse = self.__diffuse__(cos_ilm_seq2D, rot90_green)
        red_diffuse = self.__diffuse__(cos_ilm_seq2D, rot90_red)

        # Merge all channels for final encrypted frame
        merged_img = cv2.merge([blue_diffuse, green_diffuse, red_diffuse])  # merge in BGR mode

        return merged_img, perm_seed, diff_seed

    def decryptFrame(self, frame, perm_seed, diff_seed):
        height, width, channels = frame.shape
        blue, green, red = cv2.split(frame)

        # Anti-Diffusion
        cos_ilm_sequence = self.__ILMGen__(height * width, diff_seed)
        cos_ilm_seq2D = cos_ilm_sequence.reshape(width, height)

        blue_antidiffused = self.__diffuse__(cos_ilm_seq2D, blue, mode='antidiffuse')
        green_antidiffused = self.__diffuse__(cos_ilm_seq2D, green, mode='antidiffuse')
        red_antidiffused = self.__diffuse__(cos_ilm_seq2D, red, mode='antidiffuse')

        # Rotate 270
        rot270_blue = np.rot90(blue_antidiffused, 3)
        rot270_green = np.rot90(green_antidiffused, 3)
        rot270_red = np.rot90(red_antidiffused, 3)

        new_height, new_width = rot270_blue.shape  # since frames are same sizes, sample a channel for new rotated h,w

        # Permutate
        block_size = min(math.floor(math.sqrt(new_height)), math.floor(math.sqrt(new_width)))
        block_matrix = block_size * block_size

        cos_ilm_sequence = self.__ILMGen__(4 * block_matrix, perm_seed)

        P, Q, R, S = np.split(cos_ilm_sequence, 4)

        # Sort enumerated matrix and return index 0
        In_P = np.argsort(P)
        In_Q = np.argsort(Q)
        In_R = np.argsort(R)
        In_S = np.argsort(S)

        blue_scrambled = self.__permutate__(block_size, block_matrix, rot270_blue,
                                            In_P, In_Q, In_R, In_S,
                                            mode='antipermute')
        green_scrambled = self.__permutate__(block_size, block_matrix, rot270_green,
                                             In_P, In_Q, In_R, In_S,
                                             mode='antipermute')
        red_scrambled = self.__permutate__(block_size, block_matrix, rot270_red,
                                           In_P, In_Q, In_R, In_S,
                                           mode='antipermute')

        # Merge all channels for final decrypted frame
        merged_img = cv2.merge([blue_scrambled, green_scrambled, red_scrambled])  # merge in BGR mode

        return merged_img

    def encryptVideo(self, filepath, vid_destination, key_destination, password):
        fpath = Path(filepath)
        vid_dest = Path(vid_destination)
        key_dest = Path(key_destination)
        key_file = open(key_dest.absolute(), "a")

        # Prepare the video writer
        cap = cv2.VideoCapture(str(fpath.resolve()), cv2.CAP_FFMPEG)

        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))
        result = cv2.VideoWriter(
            str(vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"HFYU"),
            cap.get(cv2.CAP_PROP_FPS),
            (frame_height, frame_width),    # we use height, width as the final encryption is rotated 90 degrees
        )

        # Extract frames
        temp_path = os.path.join(os.path.dirname(filepath),
                                 'frameGen_temp')  # make temp folder in the same path as the video
        self.__frameGen__(filepath, temp_path)

        # Get a sorted list of all the frame filenames in the folder
        frame_filenames = sorted([f for f in os.listdir(temp_path) if f.endswith('.jpg')])
        sorted_frames = sorted(frame_filenames, key=lambda x: int(x.split('_')[1].split('.')[0]))

        temp_encryption_path = os.path.join(temp_path, 'encryption_temp')
        os.makedirs(temp_encryption_path)
        for curr_frame in sorted_frames:
            frame_name = os.path.join(temp_path, curr_frame)

            frame = cv2.imread(frame_name)

            merged_img, perm_seed, diff_seed = self.encryptFrame(frame)

            # Save encrypted image to another temp path
            no_extension = os.path.splitext(curr_frame)[0]
            cv2.imwrite(f"{temp_encryption_path}/{no_extension}.png", merged_img, [cv2.IMWRITE_PNG_COMPRESSION, 0])

            # Save the permutation and diffusion seeds
            key_file.write(str(perm_seed) + "\n")
            key_file.write(str(diff_seed) + "\n")

            print(f"{curr_frame} done")

        # Generate Frame Selection sequence
        FS = self.__frameSeqGen__(len(sorted_frames))

        # Write to video writer with Frame Selection sequence
        for frame_no in FS:
            result.write(cv2.imread(f"{temp_encryption_path}/frame_{frame_no}.png"))

        # Once Done, write the sequence into the key file
        key_file.write(str(FS))

        cap.release()
        key_file.close()
        self.__encryptKey__(key_dest.resolve(), password)

        if os.path.isdir(temp_path):
            shutil.rmtree(temp_path)    # delete the temp_path and its contents
        else:
            raise Exception(f"{temp_path} could not be found: Path could be either moved or deleted, please make sure"
                            f"it is completely deleted")

    def decryptVideo(self, filepath, vid_destination, key_filepath, password):
        fpath = Path(filepath)
        vid_dest = Path(vid_destination)
        key = Path(key_filepath)

        self.__decryptKey__(key.resolve(), password)

        # Prepare the video writer
        cap = cv2.VideoCapture(str(fpath.resolve()), cv2.CAP_FFMPEG)

        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))
        result = cv2.VideoWriter(
            str(vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"mp4v"),
            cap.get(cv2.CAP_PROP_FPS),
            (frame_height, frame_width),  # we use h, w again as the final decryption is rotated back to normal
        )

        # Extract frames
        temp_path = os.path.join(os.path.dirname(filepath),
                                 'frameGen_temp')  # make temp folder in the same path as the video
        self.__frameGen__(filepath, temp_path, True)

        frame_filenames = sorted([f for f in os.listdir(temp_path) if f.endswith('.png')])
        sorted_frames = sorted(frame_filenames, key=lambda x: int(x.split('_')[1].split('.')[0]))

        key_file = open(key.resolve(), "r")
        lines = key_file.readlines()

        # Get the Frame Selection sequence in the last line of the key file
        FS = lines[-1]

        # Convert the string back to list
        frame_select_seq = eval(FS)

        # Create a temp folder where deshuffled frames are moved then renaming them
        temp_fs_path = os.path.join(temp_path, 'fs_temp')
        os.makedirs(temp_fs_path)

        # rearrange the frames according the Frame Selection sequence
        for inx, curr_frame in enumerate(sorted_frames):
            source = os.path.join(temp_path, curr_frame)
            dest = os.path.join(temp_fs_path, f"frame_{frame_select_seq[inx]}.png")
            shutil.move(source, dest)

        # sort the arranged frames again in the array to be decrypted
        new_frame_filenames = sorted([f for f in os.listdir(temp_fs_path) if f.endswith('.png')])
        new_sorted_frames = sorted(new_frame_filenames, key=lambda x: int(x.split('_')[1].split('.')[0]))

        for inx, curr_frame in enumerate(new_sorted_frames):
            frame_name = os.path.join(temp_fs_path, curr_frame)

            frame = cv2.imread(frame_name)

            start_inx = inx * 2
            perm_seed = float(lines[start_inx].rstrip())
            diff_seed = float(lines[start_inx+1].rstrip())

            merged_img = self.decryptFrame(frame, perm_seed, diff_seed)

            result.write(merged_img)

            print(f"{curr_frame} done")

        cap.release()
        self.__encryptKey__(key.resolve(), password)
        key_file.close()  # finally, close the file

        if os.path.isdir(temp_path):
            shutil.rmtree(temp_path)    # delete the temp_path and its contents
        else:
            raise Exception(f"{temp_path} could not be found: Path could be either moved or deleted, please make sure"
                            f"it is completely deleted")


if __name__ == '__main__':
    e = Encrypt_cosine()
    src = r'C:\Users\Lenovo\Documents\GitHub\Medicrypt-App\tests\test388.jpg'
    frame = cv2.imread(src)
    enc, _, _ = e.encryptFrame(frame)

    cv2.imshow('e', enc)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    # e.encryptVideo(r'C:\Users\Lenovo\Documents\GitHub\Medicrypt-App\tests\test.mp4')