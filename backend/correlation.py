import array
from statistics import correlation
from filepath_parser import FilepathParser
from Crypto.Protocol.KDF import PBKDF2
import numpy as np

import cv2
import math



class Correlation:
    video_path = None
    cap = None

    def __init__(self, filepath: str):
        self.video_path = FilepathParser(filepath)
        self.cap = cv2.VideoCapture(self.video_path.get_posix_path(), cv2.CAP_FFMPEG)

    def E(self, x: list):
        temp = 1 / len(x)
        temp2 = 0

        for val in x:
            temp2 += val

        return temp * temp2

    def D(self, x: list):
        e = self.E(x)
        temp = 1 / len(x)
        temp2 = 0

        for val in x:
            temp2 += (val - e) ** 2

        return temp * temp2

    def covariance(self, x: list, y: list):
        temp = 1 / len(x)
        e_x = self.E(x)
        e_y = self.E(y)

        temp2 = 0

        for i in range(len(x)):
            val_x = x[i] - e_x
            val_y = y[i] - e_y
            temp2 += val_x * val_y

        return temp * temp2

    def R(self, x: list, y: list):
        temp1 = self.covariance(x, y)
        temp2 = math.sqrt(self.D(x) * self.D(y))
        return  temp1 / temp2


    def get_corellation_diag(self, sample : int):
        frame_width = int(self.cap.get(3))
        frame_height = int(self.cap.get(4))

        grabbed, frame = self.cap.read()

        n = sample

        pixel_x = []
        pixel_y = []
        corr = []

        for c in range(3):

            for i in range(0, frame_width-2):
                
                if n <= 0:
                    break
                
                x1 = i
                y1 = 0
                x2 = i + 1
                y2 = 1                
                while x1 >= 0 and y2 < frame_height - 1:

                    pixel_x.append(frame[y1][x1][c].astype(np.float64))
                    pixel_y.append(frame[y2][x2][c].astype(np.float64))

                    x1 -= 1
                    x2 -= 1
                    y1 += 1
                    y2 += 1
                    n -= 1

            
            for j in range (1, frame_height-2):
                
                if n <= 0:
                    break

                x1 = frame_width-2
                y1 = j
                x2 = frame_width-1
                y2 = j + 1

                while y2 < frame_height:
                    pixel_x.append(frame[y1][x1][c].astype(np.float64))
                    pixel_y.append(frame[y2][x2][c].astype(np.float64))

                    x1 -= 1
                    x2 -= 1
                    y1 += 1
                    y2 += 1
                    n -= 1

            corr.append(self.R(pixel_x, pixel_y))

        return corr


