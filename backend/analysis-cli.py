"""
The pure and raw CLI program for analytics. It is the bridge between the analytical tools for the algorithms
and the user inputted data.

Variables:
----------

1. Parser
    - A global object used to parse the the command arguments either by the user or the GUI itself.

Dependencies:
-------------

- Encryption algorithms: "3dcosine", "Fisher-Yates"
- External modules: "backend.analysis"
- Built-in modules: "csv", "argparse"
- NumPy
- OpenCV

Date Completed: 10/04/2024
"""


import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.algorithms._3d_cosine import Encrypt_cosine
from backend.analysis.correlation import Correlation
from backend.analysis.differential import Differential
from backend.algorithms.fisher_yates import Encrypt
from backend.analysis.other import EncryptionQuality
import numpy as np
import csv
import cv2
import argparse

def main():

    parser = argparse.ArgumentParser(description='For analysis purposes')

    parser.add_argument('-m', "--mode", type=str, 
                        choices=['encryption', 'correlational', 'differential', 'entropy', 'psnr', 'all'],
                        help="specifies the mode of analysis.  Default is 'all'.",
                        default='all')
    parser.add_argument('-t', "--type", type=str, choices=['fisher-yates', '3d-cosine'],
                        help="specifies the encryption type used by the datasets in the analysis", 
                        default='fisher-yates')
    parser.add_argument('-o', "--video",
                        help="specifies the path of the original video",
                        type=str,  required=True)
    parser.add_argument('-e', "--encrypted",
                        help="specifies the path of the encrypted video",
                        type=str)
    parser.add_argument('-d', "--decrypted",
                        help="specifies the path of the decrypted video",
                        type=str)
    parser.add_argument('-w', "--writepath",
                        help="specifies the write path of the csv_file (specify the filename at the end of the path)",
                        type=str, required=True)
    parser.add_argument('-k', "--key", 
                        help="specifies the path of keyfile (may not be required anymore)",
                        type=str)
    parser.add_argument('-p', '--password', 
                        help="password of the keyfile (may not be required anymore)",
                        type=str)
    parser.add_argument('-s', "--samples",
                        help="specifies the number of pixel samples for correlational analysis. Default is 1000",
                        type=int, default=1000)
    parser.add_argument('-f', "--frames",
                        help="specifies the number of frames. Default is 50",
                        type=int, default=50)
    parser.add_argument("--etime",
                        help="specifies the encrypt time file to be stored on the csv file",
                        type=str)
    parser.add_argument("--dtime",
                        help="specifies the decrypt time file to be stored on the csv file",
                        type=str)
    parser.add_argument("-v", "--verbose", action="store_true",
                        help="Enables verbose during analysis")

    args = parser.parse_args()

    cc_field = ["CC_d", "CC_h", "CC_v"]
    cc_field_e = ["CC_d_e", "CC_h_e", "CC_v_e"]
    entropy_field  = ["Entropy(R)", "Entropy(G)", "Entropy(B)", "Entropy(Combined)"]
    entropy_field_e  = ["Entropy(R)_e", "Entropy(G)_e", "Entropy(B)_e", "Entropy(Combined)_e"]
    differential_field = ["NPCR", "UACI"]
    psnr_field = ["MSE", "PSNR"]

    fields = ["Frame"]

    if args.etime != None:
        fields.append("ETime")
    if args.dtime != None:
        fields.append("DTime")
    
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
    elif args.mode == 'encryption':
        fields += cc_field
        fields += differential_field
        fields += entropy_field
        
        fields += cc_field_e
        fields += entropy_field_e
    elif args.mode == 'all':
        fields += cc_field
        fields += differential_field
        fields += entropy_field
        fields += psnr_field

        fields += cc_field_e
        fields += entropy_field_e

    #initializes csv file

    print(f"[Analyzing {args.video}]")

    with open(args.writepath, 'w', newline='') as csvfile:

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
        total_field = {"Frame": "Total"}
        
        for i in fields:
            if i == "Frame":
                continue
            mean_field[i] = []
            total_field[i] = 0                                      
        
        for i in range(args.frames):
            
            row_field = {"Frame": i}
            ret, frame = cap.read()
            
            if not ret:
                print("[DONE] Analyzation Completed Successfully")
                break

            if args.encrypted != None:
                ret_e, frame_e = cap_encrypted.read()
            if args.decrypted != None:
                ret_d, frame_d = cap_decrypted.read()

            

            if args.mode == 'correlational' or args.mode  == 'all' or args.mode == 'encryption':
                if args.verbose : print(f"[Frame {i}] Analyzing Correlation")
                cc_d = np.array(corr.get_corr_diag(frame, args.samples))
                cc_h = np.array(corr.get_corr_horizontal(frame, args.samples))
                cc_v = np.array(corr.get_corr_vertical(frame, args.samples))
                row_field["CC_d"] = np.mean(cc_d)
                row_field["CC_h"] = np.mean(cc_h)
                row_field["CC_v"] = np.mean(cc_v)
                
                total_field["CC_d"] += np.mean(cc_d)
                total_field["CC_h"] += np.mean(cc_h)
                total_field["CC_v"] += np.mean(cc_v)

                mean_field["CC_d"] += [np.mean(cc_d)]
                mean_field["CC_h"] += [np.mean(cc_h)]
                mean_field["CC_v"] += [np.mean(cc_v)]
                

                if  args.encrypted != None:
                    cc_d_e = np.array(corr.get_corr_diag(frame_e, args.samples))
                    cc_h_e = np.array(corr.get_corr_horizontal(frame_e, args.samples))
                    cc_v_e = np.array(corr.get_corr_vertical(frame_e, args.samples))
                    row_field["CC_d_e"] = np.mean(cc_d_e)
                    row_field["CC_h_e"] = np.mean(cc_h_e)
                    row_field["CC_v_e"] = np.mean(cc_v_e)

                    total_field["CC_d_e"] += np.mean(cc_d_e)
                    total_field["CC_h_e"] += np.mean(cc_h_e)                      
                    total_field["CC_v_e"] += np.mean(cc_v_e)

                    mean_field["CC_d_e"] += [np.mean(cc_d_e)]
                    mean_field["CC_h_e"] += [np.mean(cc_h_e)]
                    mean_field["CC_v_e"] += [np.mean(cc_v_e)]
                    
            if args.mode  == 'differential'  or args.mode  == 'all' or args.mode == 'encryption':
                if args.verbose : print(f"[Frame {i}] Differential Analysis")
                attacked_frame = diff.attack_pixel(frame.copy(), args.type)
                frame_width_e = len(frame_e[0])
                frame_height_e = len(frame_e)
                npcr = np.mean(diff.get_npcr(frame_e, attacked_frame, frame_width_e, frame_height_e))
                uaci = np.mean(diff.get_uaci(frame_e, attacked_frame, frame_width_e, frame_height_e))
                row_field['NPCR'] = npcr
                row_field['UACI'] = uaci
                
                total_field['NPCR'] += npcr
                total_field['UACI'] += uaci

                mean_field['NPCR'] += [npcr]
                mean_field['UACI'] += [uaci]
            if args.mode == 'entropy' or args.mode  == 'all' or args.mode == 'encryption':
                if args.verbose : print(f"[Frame {i}] Analyzing Entropy")
                B_o, G_o, R_o = cv2.split(frame.copy())
                row_field['Entropy(B)'],  row_field['Entropy(G)'], row_field['Entropy(R)'], row_field['Entropy(Combined)'] = enc_quality.get_entropy(B_o), enc_quality.get_entropy(G_o), enc_quality.get_entropy(R_o), enc_quality.get_entropy(frame)

                total_field['Entropy(B)'] += enc_quality.get_entropy(B_o)
                total_field['Entropy(G)'] += enc_quality.get_entropy(G_o)
                total_field['Entropy(R)'] += enc_quality.get_entropy(R_o)
                total_field['Entropy(Combined)'] += enc_quality.get_entropy(frame)

                mean_field['Entropy(B)'] += [enc_quality.get_entropy(B_o)]
                mean_field['Entropy(G)'] += [enc_quality.get_entropy(G_o)]
                mean_field['Entropy(R)'] += [enc_quality.get_entropy(R_o)]
                mean_field['Entropy(Combined)'] += [enc_quality.get_entropy(frame)]
                
                if args.encrypted != None:
                    B_e, G_e, R_e = cv2.split(frame_e.copy())
                    row_field['Entropy(B)_e'],  row_field['Entropy(G)_e'], row_field['Entropy(R)_e'], row_field["Entropy(Combined)_e"] = enc_quality.get_entropy(B_e), enc_quality.get_entropy(G_e), enc_quality.get_entropy(R_e), enc_quality.get_entropy(frame_e)

                    total_field['Entropy(B)_e'] += enc_quality.get_entropy(B_e)
                    total_field['Entropy(G)_e'] += enc_quality.get_entropy(G_e)
                    total_field['Entropy(R)_e'] += enc_quality.get_entropy(R_e)
                    total_field['Entropy(Combined)_e'] += enc_quality.get_entropy(frame_e)

                    mean_field['Entropy(B)_e'] += [enc_quality.get_entropy(B_e)]
                    mean_field['Entropy(G)_e'] += [enc_quality.get_entropy(G_e)]
                    mean_field['Entropy(R)_e'] += [enc_quality.get_entropy(R_e)]
                    mean_field['Entropy(Combined)_e'] += [enc_quality.get_entropy(frame_e)]

            if args.mode == 'psnr' or args.mode  == 'all' :
                if args.verbose : print(f"[Frame {i}] Analyzing PSNR")

                mse = enc_quality.get_mse(frame, frame_d)
                psnr = enc_quality.get_psnr(frame, frame_d)

                row_field['MSE'] = mse
                row_field['PSNR'] = psnr

                total_field['MSE'] +=  mse
                total_field['PSNR'] += psnr

                mean_field['MSE'] += [mse]
                mean_field['PSNR'] += [psnr]

            if args.etime != None:
                with open(args.etime, 'r') as t:
                    lines = t.readlines()
                    row_field['ETime'] = float(lines[i])
                    total_field['ETime'] += float(lines[i])
                    mean_field['ETime'] += [float(lines[i])]
            
            if args.dtime != None:
                with open(args.dtime, 'r') as t:
                    lines = t.readlines()
                    row_field['DTime'] = float(lines[i])
                    total_field['DTime'] += float(lines[i])
                    mean_field['DTime'] += [float(lines[i])]
            
            writer.writerow(row_field)

        for i in fields:
            if i == "Frame":
                continue
            if (i not in cc_field) and (i not in cc_field_e):
                mean_field[i] = np.mean(mean_field[i])
                continue

            mean_field[i] = np.tanh(np.mean(mean_field[i]))

        writer.writerow(total_field)
        writer.writerow(mean_field)

if __name__ == "__main__":
    main()