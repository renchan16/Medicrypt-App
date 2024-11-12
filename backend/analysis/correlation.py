"""
Handles the analysis for the correlation of pixels inside the frame.

Functions:
----------

Public Functions:

1. get_corellation_vid (self, sample : int, frame_count) 
    - Analyzes the correlation of each frame per pixel. Returns a list containing the correlation of pixel values per frame

2. get_corr_diag(self, frame, sample: int):
    - Calculates the correlation of each pixel with its diagonal neighbor inside the frame. Returns the correlation (R) value

3. get_corr_horizontal(self, frame, sample : int):
    - Calculates the correlation of each pixel with its horizontal neighbor inside the frame. Returns the correlation (R) value

4. get_corr_vertical(self, frame, sample : int):
    - Calculates the correlation of each pixel with its vertical neighbor inside the frame. Returns the correlation (R) value

Private Functions:

1. E(self, x: list):
    - Used in calculating the R value

2. D(self, x: list):
    - Used in calculating the R value

3. covariance(self, x: list, y: list):
    - Used in calculating the R value

4. R(self, x: list, y: list):
    - returns the R or the correlation coefficient value.

Variables:
----------

No global variables are used for this script

Dependencies:
-------------

- OpenCV
- Built-in modules: "math"

"""

import cv2
import math

class Correlation:

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
    

    def get_corr_diag(self, frame, sample: int):
        n = sample

        frame_width = len(frame[0])
        frame_height = len(frame)

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
                    if n <= 0:
                        break

                    pixel_x.append(frame[y1][x1][c].item() + 0.1)
                    pixel_y.append(frame[y2][x2][c].item() + 0.1)

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
                    if n <= 0:
                        break
                    pixel_x.append(frame[y1][x1][c].item() + 0.1)
                    pixel_y.append(frame[y2][x2][c].item() + 0.1)

                    x1 -= 1
                    x2 -= 1
                    y1 += 1
                    y2 += 1
                    n -= 1

            corr.append(self.R(pixel_x, pixel_y))
        return corr



    def get_corellation_vid(self, sample : int, frame_count):
        frame_width = int(self.cap.get(3))
        frame_height = int(self.cap.get(4))

        cc_d = []
        cc_h = []
        cc_v = []

        n = frame_count

        while True:
            grabbed, frame = self.cap.read()

            if not grabbed or frame_count <= 0:
                print("read done")
                break

            cc_d.append(self.get_corr_diag(frame, sample))
            cc_h.append(self.get_corr_horizontal(frame, sample))
            cc_v.append(self.get_corr_vertical(frame, sample))
            n -= 1
        
        return {"cc_d": cc_d, "cc_v": cc_v, "cc_h": cc_h}
        
    
    def get_corr_horizontal(self, frame, sample : int):

        corr = []
        frame_width = len(frame[0])
        frame_height = len(frame)

        for c in range(3):

            n = sample
            pixel_x = []
            pixel_y = []

            for i in range(frame_width - 2):
                if n <= 0:
                    break
                for j in range (frame_height - 1):
                    if n <= 0:
                        break
                    pixel_x.append(frame[j][i][c].item() + 0.1)
                    pixel_y.append(frame[j][i+1][c].item() + 0.1)
                    n -= 1
            
            corr.append(self.R(pixel_x, pixel_y))

        return corr
    
    def get_corr_vertical(self, frame, sample : int):

        corr = []

        frame_width = len(frame[0])
        frame_height = len(frame)
        
        for c in range(3):
            
            n = sample
            pixel_x = []
            pixel_y = []

            for j in range(frame_height - 2):
                if n <= 0:
                    break
                for i in range (frame_width - 1):
                    if n <= 0:
                        break
                    pixel_x.append(frame[j][i][c].item() + 0.1)
                    pixel_y.append(frame[j+1][i][c].item() + 0.1)
                    n -= 1
            
            corr.append(self.R(pixel_x, pixel_y))

        return corr

if  __name__ == "__main__":
    corr = Correlation()

    filepath = "/home/roel/Documents/code_projects/Medicrypt-App/backend/test_encrypt.avi"
    
    cap = cv2.VideoCapture(filepath, cv2.CAP_FFMPEG)

    ret, frame = cap.read()

    if not ret:
        print("Error opening video stream or file")
    
    print(corr.get_corr_diag(frame, 1000))
    




