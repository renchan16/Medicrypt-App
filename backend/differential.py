from fisher_yates import Encrypt

import cv2
import numpy as np
import math
from filepath_parser import FilepathParser

class Differential:

    def get_difference(self, pixel_i, pixel_j):

        if pixel_i == pixel_j:
            return 0
        else:
            return 1

    def get_npcr(self, frame_1, frame_2, width, height):

        npcr_list = []
        for c in range(3):
            temp2 = 0
            temp1 = 1 / (width * height)
            for i in range(width - 1):
                for j in range(height - 1):
                    temp2 += self.get_difference(frame_1[j][i][c], frame_2[j][i][c]) * 100
            npcr_list.append(temp1 * temp2)
        return npcr_list


    def get_uaci(self, frame1, frame2, width, height):
        temp1 = 1 / (width * height)
        temp2 = 0

        uaci_list = []
        for c in range(3):
            for i in range(width - 1):
                for j in range(height - 1):
                    temp2 += (abs(frame1 - frame2) / 255) * 100

            uaci_list.append(temp1 * temp2)

        return uaci_list
    
    def attack_pixel(self, frame):

        frame_width = len(frame[0])
        frame_height = len(frame)

        for c in range(3):
            i, j = frame_width // 3, frame_height // 3

            frame[j][i][c] = frame[j][i][c].astype(float) + 1   
            
            encryption_node = Encrypt()
            e_frame, hash = encryption_node.encryptFrame(frame)
            return e_frame

    def get_differential(self, video):
        cap = cv2.VideoCapture(video)

        grabbed1, frame1 = cap.read()

        
        encryption_node = Encrypt()


        e_frame1, hash1 = encryption_node.encryptFrame(frame1)
        e_frame2 = self.attack_pixel(frame1)

        frame_width = len(e_frame1[0])
        frame_height = len(e_frame1)

        return self.get_npcr(e_frame1, e_frame2, frame_width, frame_height)
