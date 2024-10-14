import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.algorithms.fisher_yates import Encrypt
from backend.algorithms._3d_cosine import Encrypt_cosine

import cv2
import numpy as np

class Differential:

    def get_difference(self, pixel_i, pixel_j):

        if pixel_i == pixel_j:
            return 0
        else:
            return 1

    def get_npcr(self, frame_1, frame_2, width, height):

        npcr_list = []
        for c in range(3):
            # temp2 = 0
            # temp1 = 1 / ((width-1) * (height-1))
            # for i in range(width - 1):
            #     for j in range(height - 1):
            #         temp2 += self.get_difference(frame_1[j][i][c].item(), frame_2[j][i][c].item()) * 100
            # npcr_list.append(temp1 * temp2)
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

    def get_differential(self, video, type : str):
        cap = cv2.VideoCapture(video)

        grabbed1, frame1 = cap.read()
        encryption_node = Encrypt()


        e_frame1, hash1 = encryption_node.encryptFrame(frame1)
        e_frame2 = self.attack_pixel(frame1)

        frame_width = len(e_frame1[0])
        frame_height = len(e_frame1)
        return {
            "npcr":  self.get_npcr(frame1, e_frame1, frame_width, frame_height),
            "uaci":  self.get_uaci(e_frame1, e_frame2, frame_width, frame_height)
        }
        
