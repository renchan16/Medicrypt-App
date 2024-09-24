from correlation import Correlation
from differential import Differential
from fisher_yates import Encrypt
from other import EncryptionQuality
import numpy
import csv
import cv2


def main():
    filepath = "/home/roel/Documents/code_projects/Medicrypt-App/tests/testavi.avi"

    fields = ["Frame", "CC_h", "CC_h", "CC_h", 
                        "CC_h_e", "CC_h_e", "CC_h_e", 
                        "Entropy(R)", "Entropy(G)", "Entropy(B)", "Entropy(Combined)"
                        "Entropy_e(R)", "Entropy_e(G)", "Entropy_e(B)", "Entropy(Combined)"
                        "NPCR", "NPCR_e","UACI", "UACI_e",
                        "MSE", "PSNR"]
    

    cap = cv2.VideoCapture(filepath, cv2.CAP_FFMPEG)

    n = 50
    while True:
        ret, frame = cap.read()
        rowfield = []

        if not ret:
            print("read done")
            break

        enc = Encrypt()
        corr = Correlation()
        diff = Differential()
        enc_quality = EncryptionQuality()
        
        encrypted_frame, hash = enc.encryptFrame(frame.copy())
        attacked_frame = diff.attack_pixel(frame.copy())

        cv2.imshow('test', frame.copy())

        B, G, R = cv2.split(frame.copy())
        print([enc_quality.get_entropy(R).item(), enc_quality.get_entropy(G).item(), enc_quality.get_entropy(B).item(), enc_quality.get_entropy(frame).item()])

if __name__ == "__main__":
    main()