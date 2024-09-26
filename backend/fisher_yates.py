from math import ceil
from pathlib import Path
import text_file_encryption as tfe
import numpy as np
import hashlib
import time
import cv2


class Encrypt:
    def __init__(self):
        self.num_rows = 0
        self.num_cols = 0
        self.num_channels = 3

        self.salt = b"\xb8O\xde/\xbc\x9b\\/w\x18%&]&\x0e{\x08\xb9\xfa\xe1T\x8fZ\xc8'\xb25Z\x12\x1b\xb2\x80"
        self.nonce = b"\xddR\x05#c\xdd\xe3\xcd\x10\x14kWv\x89\xdb[\xf4\x06j \xe8\x97S;\xa6\x14\xdc-\xae\x16@l"

    def hashArray(self, array):
        hash = hashlib.sha512(array.tobytes()).hexdigest()

        return hash

    def splitHash(self, hash):
        quarters = len(hash) // 4

        return [hash[i : i + quarters] for i in range(0, len(hash), quarters)]

    def convertToDecimal(self, hashes):
        into_decimal = [int(hash, 16) for hash in hashes]

        return into_decimal

    def transformDecimal(self, converted_hashes):
        transformedHash = []
        for i, decimal in enumerate(converted_hashes):
            if i % 2 == 0:  # Even indices (0, 2)
                transformedHash.append((float(f"0.{decimal}") * 0.43) + 3.57)
            else:  # Odd indices (1, 3)
                # transformedHash.append(decimal * (10 ** (-39)))
                transformedHash.append(float(f"0.{decimal}"))

        return transformedHash

    def rowShuffle(self, image, size, x0, r):
        x = x0
        x = r * x * (1 - x)
        for i in range(size - 1, 0, -1):
            j = ceil(i * x)

            image[[i, j]] = image[[j, i]]
            x = r * x * (1 - x)

        # Reshape back to original dimensions
        shuffled_pixels = image.reshape(self.num_rows, self.num_cols, self.num_channels)

        return shuffled_pixels

    def colShuffle(self, image, size, x0, r):
        x = x0
        x = r * x * (1 - x)
        for i in range(size - 1, 0, -1):
            j = ceil(i * x)

            image[:, [i, j]] = image[:, [j, i]]
            x = r * x * (1 - x)

        # Reshape back to original dimensions
        shuffled_pixels = image.reshape(self.num_rows, self.num_cols, self.num_channels)

        return shuffled_pixels

    def rowUnshuffle(self, image, swap_indices):
        for i in range(1, self.num_rows):
            u = swap_indices.pop(-1)

            image[[i, u]] = image[[u, i]]

        return image

    def colUnshuffle(self, image, swap_indices):
        for i in range(1, self.num_cols):
            u = swap_indices.pop(-1)

            image[:, [i, u]] = image[:, [u, i]]

        return image

    def generateSwapIndex(self, size, x0, r):
        swap_index = []
        x = x0

        x = r * x * (1 - x)
        swap_index.append(x)
        for i in range(size - 1, 0, -1):
            j = ceil(i * x)
            x = r * x * (1 - x)
            swap_index.append(j)

        return swap_index

    def keystream(self, res, x0, r):
        x = x0
        ks = [x0]
        # create keystream
        for i in range(2000 + ((res * 3) - 1)):
            x = r * x * (1 - x)
            ks.append(x)

        # discard first 2000
        del ks[:2000]

        # convert into numpy array
        ks_array = np.array(ks)

        # produce keystream vector
        kv = np.floor(ks_array * 10**16) % 256
        kv = kv.astype(dtype="int16")

        return kv

    def xor(self, a, b):
        return np.bitwise_xor(a, b)

    def encryptHashes(self, hash_filepath, password):
        tfe.encryptFile(hash_filepath, password)

    def decryptHashes(self, hash_filepath, password):
        tfe.decryptFile(hash_filepath, password)

    def encryptFrame(self, frame):
        self.num_rows, self.num_cols, self.num_channels = frame.shape

        print("Generating Logistic Map Seeds")
        hashed = self.hashArray(frame)

        splits = self.splitHash(hashed)
        converted = self.convertToDecimal(splits)
        transform = self.transformDecimal(
            converted
        )  # [Logmap1 r, Logmap1 x0, Logmap2 r, Logmap2, x0]
        print(f"Generated Logistic Map Seeds: {transform}")

        # Permutate
        print("Running Fisher-Yates Permutation")
        row_permutated = self.rowShuffle(
            frame, self.num_rows, transform[1], transform[0]
        )
        col_permutated = self.colShuffle(
            row_permutated, self.num_cols, transform[1], transform[0]
        )  # final permutation
        print("Permutation Done")

        flatten = col_permutated.reshape(-1, self.num_channels)

        # Create keystream vector
        print("Creating Keystream Vector")
        kv = self.keystream(
            self.num_rows * self.num_cols, transform[3], transform[2]
        )
        kr, kg, kb = np.array_split(kv, 3)  # split keystream into three
        comb_ks = np.vstack((kb, kg, kr)).T  # this is the 2d array of the keystream
        uint8_ks = comb_ks.astype(
            np.uint8
        )  # change to uint8 datatype for correct cv2 data type
        print("Created Keystream Vector")

        # diffuse the pixels
        print("Splitted Frames and Running Diffusion (XOR)")
        diffuse = self.xor(flatten, uint8_ks)
        print("Diffusion Done and Channels Merged")

        # reshape the array into a required cv2 format
        diffuse_pixels = diffuse.reshape(
            self.num_rows, self.num_cols, self.num_channels
        )

        return diffuse_pixels, hashed

    @time_encrypt
    def encryptVideo(self, filepath, vid_destination, key_destination, password):
        fpath = Path(filepath)
        vid_dest = Path(vid_destination)
        key_dest = Path(key_destination)

        # Record per frame runtime here
        per_frame_runtime = []

        cap = cv2.VideoCapture(str(fpath.resolve()), cv2.CAP_FFMPEG)

        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))
        result = cv2.VideoWriter(
            str(vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"HFYU"),
            cap.get(cv2.CAP_PROP_FPS),
            (frame_width, frame_height),
        )

        cv2.VideoWriter_fourcc("H", "F", "Y", "U")
        # open the text file that will contain the list of hashes
        hash_file = open(key_dest.absolute(), "w")

        count = 0

        length = cap.get(cv2.CAP_PROP_FRAME_COUNT)

        while True:
            start = time.time()
            grabbed, frame = cap.read()

            if not grabbed:
                print("read done")
                break

            print(f"Encrypting Frame {count}")
            diffuse_pixels, hashed = self.encryptFrame(frame)
            print(f"Frame {count} is encrypted")

            print("Writing Hash to key text file")
            hash_file.write(
                hashed + "\n"
            )  # write with newline at the end so every writes will start on new line
            print("Writing Done")

            print(f"Writing Encrypted Frame {count} to video")
            result.write(diffuse_pixels)
            print("Writing Done")

            count += 1

            stop = time.time()
            duration = stop - start
            per_frame_runtime.append(duration)

        cap.release()
        print(f"Video has been encrypted")

        hash_file.close()  # finally, close the file
        self.encryptHashes(
            key_dest.resolve(), password
        )  # and encrypt the hash file
        print(f"Key file has been encrypted")

        return per_frame_runtime

    def decryptFrame(self, frame, hash):
        self.num_rows, self.num_cols, self.num_channels = frame.shape

        print("Generating Logistic Map Seeds")
        splits = self.splitHash(hash)
        converted = self.convertToDecimal(splits)
        transform = self.transformDecimal(
            converted
        )  # [Logmap1 r, Logmap1 x0, Logmap2 r, Logmap2 x0]
        print(f"Generated Logistic Map Seeds: {transform}")

        # flatten array
        flatten = frame.reshape(-1, self.num_channels)

        print("Generating Keystream Vector")
        # create keystream vector
        kv = self.keystream(
            self.num_rows * self.num_cols, transform[3], transform[2]
        )
        kr, kg, kb = np.array_split(kv, 3)  # split keystream into three
        comb_ks = np.vstack((kb, kg, kr)).T  # this is the 2d array of the keystream
        uint8_ks = comb_ks.astype(
            np.uint8
        )  # change to uint8 datatype for correct cv2 data type
        print("Generated Keystream Vector")

        # undiffuse the pixels
        print("Splitted Frames and Running Reverse Diffusion (XOR)")
        undiffuse = self.xor(flatten, uint8_ks)

        # rejoin channels into one frame
        undiffused_frame = undiffuse.reshape(
            self.num_rows, self.num_cols, self.num_channels
        )
        print("Reverse Diffusion Done and Channels Merged")

        # generate swap index array for row and column
        print("Generate Swap Index Array for Row and Columns")
        row_swap_indices = self.generateSwapIndex(
            self.num_rows, transform[1], transform[0]
        )
        col_swap_indices = self.generateSwapIndex(
            self.num_cols, transform[1], transform[0]
        )
        print("Swap Index Array Generated")

        # unshuffle the undiffused frame, then the unshuffled column frame
        print("Running Reverse Fisher-Yates Permutation")
        col_unshuffled = self.colUnshuffle(undiffused_frame, col_swap_indices)
        row_unshuffled = self.rowUnshuffle(col_unshuffled, row_swap_indices)
        print("Reverse Fisher-Yates Permutation Done")

        return row_unshuffled

    @time_encrypt
    def decryptVideo(self, filepath, vid_destination, hash_filepath, password):
        fpath = Path(filepath)
        vid_dest = Path(vid_destination)
        key = Path(hash_filepath)

        # Record per frame runtime here
        per_frame_runtime = []

        self.decryptHashes(key.resolve(), password)
        print("Decrypted the Key Hash File")

        cap = cv2.VideoCapture(str(fpath.resolve()), cv2.CAP_FFMPEG)

        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))

        result = cv2.VideoWriter(
            str(vid_dest.absolute()),
            cv2.VideoWriter_fourcc(*"mp4v"),
            cap.get(cv2.CAP_PROP_FPS),
            (frame_width, frame_height),
        )

        hash_file = open(key.resolve(), "r")
        lines = hash_file.readlines()
        hash_line = 0  # keep track of our line in the text file

        count = 0

        length = cap.get(cv2.CAP_PROP_FRAME_COUNT)

        while True:
            start = time.time()
            grabbed, frame = cap.read()

            if not grabbed:
                print("read done")
                break

            print(f"Grabbing the Hash for Frame {count}")
            hashed = lines[hash_line].rstrip()

            # Decrypt
            print(f"Decrypting Frame {count}")
            row_unshuffled = self.decryptFrame(frame, hashed)
            print(f"Frame {count} is Decrypted")

            print(f"Writing Decrypted Frame {count} to video")
            result.write(row_unshuffled)
            print(f"Writing Done")

            count += 1
            hash_line += 1

            stop = time.time()
            duration = stop - start
            per_frame_runtime.append(duration)

        cap.release()
        print(f"Video has been Decrypted")
        self.encryptHashes(key.resolve(), password)
        hash_file.close()  # finally, close the file

        return per_frame_runtime
