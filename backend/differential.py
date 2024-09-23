from turtle import width
from fisher_yates import Encrypt

import cv2
import numpy as np
import math
from filepath_parser import FilepathParser

class Differential:

    def get_difference(self, pixel_i, pixel_j):

        if pixel_i == pixel_j:
            return 1
        else:
            return 0

    def get_npcr(self, frame_1, frame_2, width, height):

        temp2 = 0
        temp1 = 1 / (width * height)

        npcr_list = [] 
        for c in range(1):
            for i in range(width):
                for j in range(height):
                    temp2 += self.get_difference(frame_1[j][i][c], frame_2[j][i][c]) * 100
            npcr_list.append(temp1 * temp2)
        return npcr_list

    def get_uaci(self, frame1, frame2, width, height):
        temp1 = 1 / (width * height)
        temp2 = 0

        uaci_list = []
        for c in range(3):
            for i in range(width):
                for j in range(height):
                    temp2 += (abs(frame1 - frame2) / 255) * 100

            uaci_list.append(temp1 * temp2)

        return uaci_list
    
    def attack_pixel(self, video, destination_path):

        dest_path = FilepathParser(destination_path)
        cap = cv2.VideoCapture(video)

        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))

        result = cv2.VideoWriter(
            dest_path.get_posix_path(),
            cv2.VideoWriter_fourcc(*"HFYU"),
            cap.get(cv2.CAP_PROP_FPS),
            (frame_width, frame_height),
        )

        while True:
            grabbed, frame = cap.read()

            if not grabbed:
                print("write done")
            
            for c in range(3):
                i, j = frame_width // 3, frame_height //3
                new_pixel = frame[j][i][c]

                # for i in range(frame[j][i][c]):

                # frame[j][i] = 

    def print_differential(self, e_video1, e_video2):
        cap1 = cv2.VideoCapture(e_video1)
        cap2 = cv2.VideoCapture(e_video2)

        frame_width = int(cap1.get(3))
        frame_height = int(cap2.get(4))

        grabbed1, frame1 = cap1.read()
        grabbed2, frame2 = cap2.read()

        return self.get_npcr(frame1, frame2, frame_width, frame_height)
    