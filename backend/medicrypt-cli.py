from filepath_parser import FilepathParser
from fisher_yates import Encrypt

import sys

testpath = "/home/roel/ctest.p"

fpath = FilepathParser(testpath)

print(fpath.get_posix_path())

encryption = Encrypt()

#encryption.encryptVideo('/home/roel/Documents/code_projects/Medicrypt-App/tests/testavi.avi', '/home/roel/Documents/code_projects/Medicrypt-App/tests/test_encrypt.avi', '/home/roel/Documents/code_projects/Medicrypt-App/tests/vid_key.key', '12345')

#encryption.decryptVideo('/home/roel/Documents/code_projects/Medicrypt-App/tests/test_encrypt.avi', '/home/roel/Documents/code_projects/Medicrypt-App/tests/test_decrypt.avi', '/home/roel/Documents/code_projects/Medicrypt-App/tests/vid_key.key', '12345')

n = len(sys.argv)



