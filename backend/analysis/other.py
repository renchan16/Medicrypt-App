"""
Handles the entropy and the decryption quality for analysis

Functions:
----------

Public Functions:

1. get_psnr(self, o_frame, e_frame):
    - Returns the PSNR between the original and decrypted frame.

2. get_mse(self, frame1, frame2):
    - returns the Mean squared error (MSE) between the original and decrypted frame.

3. get_entropy(self, frame):
    - returns the entropy value of a frame


Variables:
----------

No global variables are used for this script

Dependencies:
-------------

- Scipy
- Numpy
- OpenCV
- Built-in modules: "sys"

Code Author: Roel Castro
Date Created: 9/24/2024
Date Modified: 10/15/2024

"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

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
