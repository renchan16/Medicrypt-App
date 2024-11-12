"""
Handles the differential attack analysis for the encryption quality.

Functions:
----------

Public Functions:

1. get_npcr(self, frame_1, frame_2, width, height):
    - returns the number of pixel change rate (NPCR) between two frames.

2. get_uaci(self, frame1, frame2, width, height):
    - returns the unified average changing intensity (UACI) between two frames.

3. attack_pixel(self, frame, type : str):
    - modifies a single pixel in the frame and encrypts it given the encryption type. returns the attacked frame


Variables:
----------

No global variables are used for this script

Dependencies:
-------------

- OpenCV
- Built-in modules: "math"

Code Author: Roel Castro
Date Created: 9/21/2024
Date Modified: 10/14/2024

"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.algorithms.fisher_yates import Encrypt
from backend.algorithms._3d_cosine import Encrypt_cosine

import cv2
import numpy as np

class Differential:

    def get_npcr(self, frame_1, frame_2, width, height):

        npcr_list = []
        for c in range(3):
            diff = np.sum(frame_1 != frame_2)
            total_pixels = frame_1.size
            npcr_list.append((diff/ total_pixels) * 100)
            
        return npcr_list


    def get_uaci(self, frame1, frame2, width, height):
        temp1 = 1 / (width * height)
        
        uaci_list = []
        for c in range(3):
            temp2 = 0
            for i in range(width - 1):
                for j in range(height - 1):
                    temp2 += (abs(frame1[j][i][c].item() - frame2[j][i][c].item()) / 255) * 100
            uaci_list.append(temp1 * temp2)

        return uaci_list
    
    def attack_pixel(self, frame, type : str):

        frame_width = len(frame[0])
        frame_height = len(frame)

        for c in range(3):
            i, j = frame_width // 3, frame_height // 3
            frame[j][i][c] = frame[j][i][c].astype(float) + 1
            e_frame, enc_node = None, None
            
            if type == "fisher-yates": 
                enc_node = Encrypt()
                e_frame, hash = enc_node.encryptFrame(frame)
                
            elif type == "3d-cosine":
                enc_node = Encrypt_cosine()
                e_frame, perm_seed, diff_seed = enc_node.encryptFrame(frame)
            else:
                raise ValueError("Invalid encryption type")
            return e_frame
        
