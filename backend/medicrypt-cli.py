"""
The pure and raw CLI program. It acts as an intermediary between the pure raw algorithm and the user or GUI program to specify 
the users intended task. It contains the necessary command flags using python's built-in command argument parser to handle
the the user input (whether by GUI or CLI).

Variables:
----------

No global variable used in this script

Dependencies:
-------------
- Encryption algorithms: "3dcosine", "Fisher-Yates"
- Built-in modules: "argparse", "sys"
- External modules: "logfilewriter"

Date Completed: 09/26/2024
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from backend.algorithms.fisher_yates import Encrypt
from backend.algorithms._3d_cosine import Encrypt_cosine
from pathlib import Path

import backend.utils.logfilewriter as logfilewriter
import argparse

def main():

    parser = argparse.ArgumentParser(description='For encrypting videos')

    #Insert arguments here
    parser.add_argument('mode', type=str, choices=['encrypt', 'decrypt'])
    parser.add_argument('-t', '--type', default="fisher-yates", help="specifies encryption algorithm type", choices=['fisher-yates', '3d-cosine'])
    parser.add_argument('-i', '--input', required=True, help="specifies the path of video being encrypted")
    parser.add_argument('-o', '--output', required=True, help="specifies the output of the video")
    parser.add_argument('-k', '--key', help="(required for decryption) specifies the key path")
    parser.add_argument('-p', '--password', required=True, help="specifies the password of the key file")
    parser.add_argument('-v', '--verbose', action='store_true', help="displays the encryption process")
    parser.add_argument('-f', '--frames', type=int, help="specifies the number of frames (for testing purposes only)", default=-1)
    parser.add_argument('--storetime', type=str)

    args = parser.parse_args()

    if args.key == None and args.mode == 'encrypt':
        fpath = Path(args.output)
        args.key = f"{fpath.parent}/{fpath.stem}.key"
    elif args.key == None and args.mode == 'decrypt':
        print("You must specify the encrypted hash file first before decrypting")
        return
    
    video = None
    
    if args.type == "fisher-yates":
        encrypt_mod = Encrypt()
        if args.mode == 'encrypt':
            video = encrypt_mod.encryptVideo(args.input, args.output, args.key, args.password, args.verbose, args.frames)
            pass
        elif args.mode == 'decrypt':
            video = encrypt_mod.decryptVideo(args.input, args.output, args.key, args.password, args.verbose, args.frames)
            pass
        
    elif args.type == "3d-cosine":
        encrypt_mod = Encrypt_cosine()
        if args.mode == 'encrypt':
            video = encrypt_mod.encryptVideo(args.input, args.output, args.key, args.password, args.verbose, args.frames)
            pass
        elif args.mode == 'decrypt':
            video = encrypt_mod.decryptVideo(args.input, args.output, args.key, args.password, args.verbose, args.frames)
            pass
    
    if (args.storetime != None):
        
        logfilewriter.logwrite(video, args.storetime)
    

    

if __name__ == "__main__":
    main()

