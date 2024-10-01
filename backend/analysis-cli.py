from dataclasses import field
from difflib import diff_bytes
from _3d_cosine import Encrypt_cosine
from correlation import Correlation
from differential import Differential
from fisher_yates import Encrypt
from other import EncryptionQuality
import pandas as pd
import numpy as np
import csv
import cv2
import sys
import argparse
import pathlib
import math
import text_file_encryption as tfe


def main():

    parser = argparse.ArgumentParser(description='For analysis purposes')

    parser.add_argument('-m', "--mode", type=str, choices=['correlational', 'differential', 'entropy', 'psnr', 'all'], required=True)
    parser.add_argument('-t', "--type", type=str, choices=['fisher-yates', '3d-cosine'], default='fisher-yates')
    parser.add_argument('-o', "--video", type=str)
    parser.add_argument('-e', "--encrypted", type=str)
    parser.add_argument('-d', "--decrypted", type=str)
    parser.add_argument('-w', "--writepath", type=str)
    parser.add_argument('-k', "--key", type=str)
    parser.add_argument('-p', '--password', type=str)
    parser.add_argument('-s', "--samples", type=int, default=1000)
    parser.add_argument('-f', "--frames", type=int, default=50)

    args = parser.parse_args()

    cc_field = ["CC_d", "CC_h", "CC_v"]
    cc_field_e = ["CC_d_e", "CC_h_e", "CC_v_e"]
    entropy_field  = ["Entropy(R)", "Entropy(G)", "Entropy(B)", "Entropy(Combined)"]
    entropy_field_e  = ["Entropy(R)_e", "Entropy(G)_e", "Entropy(B)_e", "Entropy(Combined)_e"]
    differential_field = ["NPCR", "UACI"]
    psnr_field = ["MSE", "PSNR"]

    fields = ["Frame"]
    
    if args.mode == 'correlational':
        fields += cc_field
        if args.encrypted != None:
            fields += cc_field_e
    elif args.mode  == 'differential':
        fields += differential_field
    elif args.mode == 'entropy':
        fields += entropy_field
        if args.encrypted != None:
            fields += entropy_field_e
    elif args.mode == 'psnr':
        fields += psnr_field
    elif args.mode == 'all':
        fields += cc_field
        fields += differential_field
        fields += entropy_field
        fields += psnr_field

        fields += cc_field_e
        fields += entropy_field_e

    #initializes csv file

    with open(args.writepath, 'w', newline='') as csvfile:

        print(fields)

        writer = csv.DictWriter(csvfile, fieldnames=fields)
        writer.writeheader()
        #modules initialization
        fish_enc = Encrypt()
        cos_enc = Encrypt_cosine()
        corr = Correlation()
        diff = Differential()
        enc_quality = EncryptionQuality()
        requires_encrypted_list = ['differential', 'all']
        #variable initialization
        cap = None
        cap_encrypted = None
        cap_decrypted = None
        ret, frame = None, None
        ret_e, frame_e = None, None
        ret_d, frame_d = None, None
        #Video Capture initialization
        cap = cv2.VideoCapture(args.video, cv2.CAP_FFMPEG)
        if args.encrypted != None:
            cap_encrypted = cv2.VideoCapture(args.encrypted, cv2.CAP_FFMPEG)
        
        if args.decrypted != None:
            cap_decrypted = cv2.VideoCapture(args.decrypted, cv2.CAP_FFMPEG)

        mean_field = {"Frame": "Mean"}
        for i in fields:
            if i == "Frame":
                continue
            mean_field[i] = []
        
        for i in range(args.frames):
            
            row_field = {"Frame": i}
            print(i)
            ret, frame = cap.read()
            
            if not ret:
                print("frame end")
                break

            if args.encrypted != None:
                ret_e, frame_e = cap_encrypted.read()
            if args.decrypted != None:
                ret_d, frame_d = cap_decrypted.read()

            

            if args.mode == 'correlational' or args.mode  == 'all':
                cc_d = np.array(corr.get_corr_diag(frame, args.samples))
                cc_h = np.array(corr.get_corr_horizontal(frame, args.samples))
                cc_v = np.array(corr.get_corr_vertical(frame, args.samples))
                row_field["CC_d"] = np.tanh(np.mean(np.atanh(cc_d)))
                row_field["CC_h"] = np.tanh(np.mean(np.atanh(cc_h)))
                row_field["CC_v"] = np.tanh(np.mean(np.atanh(cc_v)))

                mean_field["CC_d"] += [np.mean(np.atanh(cc_d))]
                mean_field["CC_h"] += [np.mean(np.atanh(cc_h))]
                mean_field["CC_v"] += [np.mean(np.atanh(cc_v))]
                

                if  args.encrypted != None:
                    cc_d_e = np.array(corr.get_corr_diag(frame_e, args.samples))
                    cc_h_e = np.array(corr.get_corr_horizontal(frame_e, args.samples))
                    cc_v_e = np.array(corr.get_corr_vertical(frame_e, args.samples))
                    row_field["CC_d_e"] = np.tanh(np.mean(np.atanh(cc_d_e)))
                    row_field["CC_h_e"] = np.tanh(np.mean(np.atanh(cc_h_e)))
                    row_field["CC_v_e"] = np.tanh(np.mean(np.atanh(cc_v_e)))
                    mean_field["CC_d_e"] += [np.mean(np.atanh(cc_d_e))]
                    mean_field["CC_h_e"] += [np.mean(np.atanh(cc_h_e))]
                    mean_field["CC_v_e"] += [np.mean(np.atanh(cc_v_e))]
                    
            if args.mode  == 'differential'  or args.mode  == 'all':
                attacked_frame = diff.attack_pixel(frame, args.type)
                frame_width_e = len(frame_e[0])
                frame_height_e = len(frame_e)
                npcr = np.mean(diff.get_npcr(frame_e, attacked_frame, frame_width_e, frame_height_e))
                uaci = np.mean(diff.get_uaci(frame_e, attacked_frame, frame_width_e, frame_height_e))
                row_field['NPCR'] = npcr
                row_field['UACI'] = uaci

                mean_field['NPCR'] += [npcr]
                mean_field['UACI'] += [uaci]
            if args.mode == 'entropy' or args.mode  == 'all':
                B_o, G_o, R_o = cv2.split(frame.copy())
                row_field['Entropy(B)'],  row_field['Entropy(G)'], row_field['Entropy(R)'], row_field['Entropy(Combined)'] = enc_quality.get_entropy(B_o), enc_quality.get_entropy(G_o), enc_quality.get_entropy(R_o), enc_quality.get_entropy(frame)

                mean_field['Entropy(B)'] += [enc_quality.get_entropy(B_o)]
                mean_field['Entropy(G)'] += [enc_quality.get_entropy(G_o)]
                mean_field['Entropy(R)'] += [enc_quality.get_entropy(R_o)]
                mean_field['Entropy(Combined)'] += [enc_quality.get_entropy(frame)]
                
                if args.encrypted != None:
                    B_e, G_e, R_e = cv2.split(frame_e.copy())
                    row_field['Entropy(B)_e'],  row_field['Entropy(G)_e'], row_field['Entropy(R)_e'], row_field["Entropy(Combined)_e"] = enc_quality.get_entropy(B_e), enc_quality.get_entropy(G_e), enc_quality.get_entropy(R_e), enc_quality.get_entropy(frame_e)

                    mean_field['Entropy(B)_e'] += [enc_quality.get_entropy(B_e)]
                    mean_field['Entropy(G)_e'] += [enc_quality.get_entropy(G_e)]
                    mean_field['Entropy(R)_e'] += [enc_quality.get_entropy(R_e)]
                    mean_field['Entropy(Combined)_e'] += [enc_quality.get_entropy(frame_e)]

            if args.mode == 'psnr' or args.mode  == 'all':
                row_field['MSE'] = enc_quality.get_mse(frame, frame_d)
                row_field['PSNR'] = enc_quality.get_psnr(frame, frame_d)

                mean_field['MSE'] += [enc_quality.get_mse(frame, frame_d)]
                mean_field['PSNR'] +=[enc_quality.get_psnr(frame, frame_d)]
            
            writer.writerow(row_field)

        for i in fields:
            if i not in cc_field or i not in cc_field_e:
                mean_field[i] = np.mean(np.array(mean_field[i]))

            mean_field[i] = np.tanh(np.mean(np.array(mean_field[i])))

        writer.writerow(mean_field)

if __name__ == "__main__":
    main()