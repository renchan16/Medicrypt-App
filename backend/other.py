from filepath_parser import FilepathParser
from fisher_yates import Encrypt
from scipy.stats import entropy
import numpy as np
import cv2



class EncryptionQuality:

    def get_psnr(self, o_frame, e_frame):
        return cv2.PSNR(o_frame, e_frame, 255)
    
    def get_mse(self, frame1, frame2):
        return np.mean((frame1.astype(np.float64) / 255 - frame2.astype(np.float64) / 255) ** 2)
    
    def get_entropy(self, frame):
        frame_read = frame

        _bins = 256

        hist, _ = np.histogram(frame_read.ravel(), bins=_bins, range=(0, _bins))

        prob_dist = hist / hist.sum()
        frame_entropy = entropy(prob_dist, base=2)

        return frame_entropy
    
    def get_encryption_quality(self, video_path):

        fpath = FilepathParser(video_path)

        cap = cv2.VideoCapture(fpath.get_posix_path(), cv2.CAP_FFMPEG)

        frame_width = int(cap.get(3))
        frame_height = int(cap.get(4))

        encrypt = Encrypt()
        while True:
            grabbed, frame = cap.read()

            if not grabbed:
                print("Error opening video stream or file")
                return
            
            e_frame, hash =  encrypt.encryptFrame(frame.copy())
            d_frame = encrypt.decryptFrame(e_frame, hash)
            return self.get_psnr(frame, d_frame), self.get_mse(frame, d_frame), self.entropy_calc(frame)