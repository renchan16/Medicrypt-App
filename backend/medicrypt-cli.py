from filepath_parser import FilepathParser
from fisher_yates import Encrypt
from _3d_cosine import Encrypt_cosine
from pathlib import Path

import logfilewriter
import sys
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
            video = encrypt_mod.encryptVideo(args.input, args.output, args.key, args.password, args.verbose)
            pass
        elif args.mode == 'decrypt':
            video = encrypt_mod.decryptVideo(args.input, args.output, args.key, args.password, args.verbose)
            pass
        
    elif args.type == "3d-cosine":
        encrypt_mod = Encrypt_cosine()
        if args.mode == 'encrypt':
            video = encrypt_mod.encryptVideo(args.input, args.output, args.key, args.password, args.verbose)
            pass
        elif args.mode == 'decrypt':
            video = encrypt_mod.decryptVideo(args.input, args.output, args.key, args.password, args.verbose)
            pass
        return
    
    if (args.storetime != None):
        logfilewriter.logwrite(video, args.storetime)
    

    

if __name__ == "__main__":
    main()

