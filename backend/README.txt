See help for usage syntax by typing the following command:

----------------------------------------

python medicrypt-cli.py -h

----------------------------------------

EXAMPLES:

python medicrypt-cli.py encrypt  -i ./to_folder/testvid.mp4 -o ./gseed/to_output_folder/output.avi -t fisher_yates -k /path/to/key/keyfile.key -p <password>
python medicrypt-cli.py decrypt  -i ./to_folder/testvid.mp4 -o ./gseed/to_output_folder/output.avi -t fisher_yates -k /path/to/key/keyfile.key -p <password>


NOTE:

for encryption. -k (key) flag can be omitted. however, the decryption requires the key flag for specifying the key file.

examples:

--------------------------------------------------------------------------------------------------

python medicrypt-cli.py encrypt  -i ./to_folder/testvid.mp4 -o ./gseed/to_output_folder/output.avi  -p 12345

--------------------------------------------------------------------------------------------------


note that there are no key (-k) flag and (-t) encryption type in the syntax. that is because it defaults the keyfile to its own path. however, decryption 
requires the key flag to determine the encryption key.

--------------------------------------------------------------------------------------------------------------------------

python medicrypt-cli.py decrypt  -i ./to_folder/testvid.mp4 -o ./gseed/to_output_folder/output.avi -k /path/to/keyfile.key -p 12345

--------------------------------------------------------------------------------------------------------------------------




