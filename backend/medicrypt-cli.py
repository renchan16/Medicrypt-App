from filepath_parser import FilepathParser
from fisher_yates import Encrypt

import sys
import argparse


def main():

    parser = argparse.ArgumentParser(description='For encrypting videos')
    parser.add_argument('mode', type=str, choices=['encrypt', 'decrypt'])
    parser.add_argument('-t', '--type')
    parser.add_argument('-i', '--input', required=True)
    parser.add_argument('-o', '--output', required=True)
    parser.add_argument('-k', '--key')
    parser.add_argument('-p', '--password', required=True)

    args = parser.parse_args()

    if args.key == None and args.mode == 'encrypt':
        fpath = FilepathParser(args.input)
        args.key = fpath.get_dir_only()

    encrypt_mod = Encrypt()
    if args.mode == 'encrypt':
        encrypt_mod.encryptVideo(args.input, args.output, args.key, args.password)
        pass
    elif args.mode == 'decrypt':
        encrypt_mod.decryptVideo(args.input, args.output, args.key, args.password)
        pass
    

if __name__ == "__main__":
    main()

