from dataclasses import field
from correlation import Correlation
from differential import Differential
from fisher_yates import Encrypt
from other import EncryptionQuality
import numpy
import csv
import cv2
import sys
import argparse
import pathlib


def main():

    parser = argparse.ArgumentParser(description='For analysis purposes')

    parser.add_argument('-m', "--mode", type=str, choices=['correlational', 'differential', 'entropy', 'psnr', 'all'], required=True)
    parser.add_argument('-o', "--video", type=str)
    parser.add_argument('-e', "--encrypted", type=str)
    parser.add_argument('-d', "--decrypted", type=str)
    parser.add_argument('-w', "--writepath", type=str)
    parser.add_argument('-s', "--samples", type=int, default=1000)
    parser.add_argument('-f', "--frames", type=int, default=50)

    args = parser.parse_args()

    cc_field = ["CC_d", "CC_h", "CC_v"]
    entropy_field  = ["Entropy(R)", "Entropy(G)", "Entropy(B)", "Entropy(Combined)"]
    differential_field = ["NPCR", "UACI"]
    psnr_field = ["MSE", "PSNR"]

    fields = ["frame"]
    
    if args.mode == 'correlational':
        fields.append(cc_field)
    elif args.mode  == 'differential':
        fields.append(differential_field)
    elif args.mode == 'entropy':
        fields.append(entropy_field)
    elif args.mode == 'psnr':
        fields.append(psnr_field)
    elif args.mode == 'all':
        fields.append(cc_field)
        fields.append(differential_field)
        fields.append(entropy_field)
        fields.append(psnr_field)

    #initializes csv file

    with open(args.writepath, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()

        enc = Encrypt()
        corr = Correlation()
        diff = Differential()
        enc_quality = EncryptionQuality()

        cap = cv2.VideoCapture()



        if args.mode == 'correlational' or args.mode  == 'all':
            cc_d = corr.get_corr_diag(args.video)
            cc_h = corr.get_corr_horizontal(args.video)
            cc_v = corr.get_corr_vertical(args.video)
            
            pass
        elif args.mode  == 'differential'  or args.mode  == 'all':

            pass
        elif args.mode == 'entropy' or args.mode  == 'all':
            pass
        elif args.mode == 'psnr' or args.mode  == 'all':
            pass



    with open('testcsv.csv', 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()

        for i in range(n):
            ret, frame = cap.read()

            if not ret:
                print("read done")
                break

            enc = Encrypt()
            corr = Correlation()
            diff = Differential()
            enc_quality = EncryptionQuality()
            
            encrypted_frame, hash = enc.encryptFrame(frame.copy())
            attacked_frame = diff.attack_pixel(frame.copy())
            decrypted_frame = enc.decryptFrame(encrypted_frame, hash)

            frame_width_o = len(frame[0])
            frame_length_o = len(frame)
            frame_width_e = len(encrypted_frame[0])
            frame_length_e = len(encrypted_frame)

            corr_o = [corr.get_corr_diag(frame, 1000), corr.get_corr_horizontal(frame, 1000), corr.get_corr_vertical(frame, 100)]
            corr_e = [corr.get_corr_diag(encrypted_frame, 1000), corr.get_corr_horizontal(encrypted_frame, 1000), corr.get_corr_vertical(encrypted_frame, 100)]

            npcr_e = diff.get_npcr(encrypted_frame, attacked_frame, frame_width_e, frame_length_e)
            uaci_e = diff.get_uaci(encrypted_frame, attacked_frame, frame_width_e, frame_length_e)

            B_o, G_o, R_o = cv2.split(frame.copy())
            B_e, G_e, R_e = cv2.split(encrypted_frame)

            entropy_o = [enc_quality.get_entropy(R_o).item(), enc_quality.get_entropy(G_o).item(), enc_quality.get_entropy(B_o).item(), enc_quality.get_entropy(frame).item()]
            entropy_e = [enc_quality.get_entropy(R_e).item(), enc_quality.get_entropy(G_e).item(), enc_quality.get_entropy(B_e).item(), enc_quality.get_entropy(encrypted_frame).item()]

            mse_o = enc_quality.get_mse(frame, decrypted_frame)
            psnr_o = enc_quality.get_psnr(frame, decrypted_frame)

            writer.writerow({'Frame': i, "CC_d": corr_o[0][0], "CC_h": corr_o[1][0], "CC_v": corr_o[2][0], 
                                        "CC_d_e": corr_e[0][0], "CC_h_e": corr_e[1][0], "CC_v_e": corr_e[2][0], 
                                        "Entropy(R)": entropy_o[0], "Entropy(G)": entropy_o[1], "Entropy(B)" : entropy_o[2], "Entropy(Combined)": entropy_o[3],
                                        "Entropy_e(R)" : entropy_e[0], "Entropy_e(G)" : entropy_e[1], "Entropy_e(B)" : entropy_e[2], "Entropy(Combined)" : entropy_e[3],
                                        "NPCR": npcr_e[0],"UACI" : uaci_e[0],
                                        "MSE": mse_o, "PSNR": psnr_o})
            


if __name__ == "__main__":
    main()