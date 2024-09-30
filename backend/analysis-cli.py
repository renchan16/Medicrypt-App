from dataclasses import field
from difflib import diff_bytes
from _3d_cosine import Encrypt_cosine
from correlation import Correlation
from differential import Differential
from fisher_yates import Encrypt
from other import EncryptionQuality
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
    entropy_field  = ["Entropy(R)", "Entropy(G)", "Entropy(B)", "Entropy(Combined)"]
    differential_field = ["NPCR", "UACI"]
    psnr_field = ["MSE", "PSNR"]

    fields = ["Frame"]
    
    if args.mode == 'correlational':
        fields.append(cc_field)
    elif args.mode  == 'differential':
        fields.append(differential_field)
    elif args.mode == 'entropy':
        fields.append(entropy_field)
    elif args.mode == 'psnr':
        fields += psnr_field
    elif args.mode == 'all':
        fields.append(cc_field)
        fields.append(differential_field)
        fields.append(entropy_field)
        fields.append(psnr_field)

    #initializes csv file

    with open(args.writepath, 'w', newline='') as csvfile:

        tfe.decryptFile(args.key, args.password)

        with open(args.key, 'r',  newline='') as keyfile:
            try:
                lines = keyfile.readlines()
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
                
                if (args.mode == 'psnr' or args.mode == 'all') and args.decrypted != None:
                    cap_decrypted = cv2.VideoCapture(args.decrypted, cv2.CAP_FFMPEG)
                

                for i in range(args.frames):
                    
                    row_field = {"Frame": i}
                    print(i)
                    ret, frame = cap.read()
                    

                    if not ret:
                        print("frame end")
                        break

                    if args.encrypted != None:
                        ret_e, frame_e = cap_encrypted.read()
                        
                    if (args.mode == 'psnr' or args.mode == 'all'):
                        if args.decrypted != None:
                            ret_d, frame_d = cap_decrypted.read()
                        else:
                            if args.type == 'fisher-yates':
                                frame_d = fish_enc.decryptFrame(frame_e, lines[i].rstrip())
                            elif args.type == '3d-cosine':
                                start_inx = i * 2
                                perm_seed = float(lines[start_inx].rstrip())
                                diff_seed = float(lines[start_inx + 1].rstrip())
                                frame_d = cos_enc.decryptFrame(frame_e, perm_seed, diff_seed)
                                print(frame_d.dtype)
                                cv2.imshow('frame_e', frame_e)
                                cv2.imshow('test', frame_d)

                    if args.mode == 'correlational' or args.mode  == 'all':
                        cc_d = np.array(corr.get_corr_diag(frame))
                        cc_h = np.array(corr.get_corr_horizontal(frame))
                        cc_v = np.array(corr.get_corr_vertical(frame))

                        row_field["CC_d"] = np.mean(np.atanh(cc_d))
                        row_field["CC_h"] = np.mean(np.atanh(cc_h))
                        row_field["CC_v"] = np.mean(np.atanh(cc_v))
                            
                    elif args.mode  == 'differential'  or args.mode  == 'all':

                        attacked_frame = diff.attack_pixel(frame)
                        
                        npcr = np.mean(diff.get_npcr(frame_e, attacked_frame))
                        uaci = np.mean(diff.get_uaci(frame_e, attacked_frame))

                        row_field['NPCR'] = npcr
                        row_field['UACI'] = uaci
                        
                    elif args.mode == 'entropy' or args.mode  == 'all':
                        pass
                    elif args.mode == 'psnr' or args.mode  == 'all': 
                        row_field['PSNR'] = enc_quality.get_psnr(frame, frame_d)

                    writer.writerow(row_field)
            except Exception as e:
                tfe.encryptFile(args.key, args.password)
                raise e
            tfe.encryptFile(args.key, args.password)

if __name__ == "__main__":
    main()