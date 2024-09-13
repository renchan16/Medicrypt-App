from filepath_parser import FilepathParser
from fisher_yates import Encrypt

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

    args = parser.parse_args()

    if args.key == None and args.mode == 'encrypt':
        fpath = FilepathParser(args.output)
        args.key = f"{fpath.get_dir_only()}/{fpath.get_filename(exclude_file_extension=True)}.key"
    elif args.key == None and args.mode == 'decrypt':
        print("You must specify the encrypted hash file first before decrypting")
        return
    
    if args.type == "fisher-yates":
        encrypt_mod = Encrypt()
        if args.mode == 'encrypt':
            encrypt_mod.encryptVideo(args.input, args.output, args.key, args.password)
            pass
        elif args.mode == 'decrypt':
            encrypt_mod.decryptVideo(args.input, args.output, args.key, args.password)
            pass
    elif args.type == "3d-cosine":
        print("Not yet implemented")
        return
    

if __name__ == "__main__":
    main()

