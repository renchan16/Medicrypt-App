"""
This module provides classes `EncryptionProcessHandler` and `AnalysisProcessHandler` to manage encryption, decryption, and analysis processes 
for video files. These classes handle file inputs, manage subprocesses, and handle errors and halting of processes.

Classes:
--------
1. EncryptionProcessHandler:
   - Manages the encryption and decryption of video files using subprocess to run MediCrypt CLI commands.
   - Provides support for halting the process, error handling, and cleanup of generated files.

   Attributes:
   -----------
   - algorithm (str): The encryption algorithm to use (FY-Logistic or 3D-cosine).
   - input_filepaths (dict[str]): Dictionary of input file paths for videos to be processed.
   - password (str): The password used for encryption/decryption.
   - output_dirpath (str): The directory path where output files will be saved.
   - hash_path (str): Path for storing or retrieving hash keys used in encryption.
   - input_files (list): Stores the names of input files.
   - output_filepaths (list): Stores the file paths of processed output files.
   - time_filepaths (list): Stores the file paths for time analysis results.
   - process (subprocess.Popen): Manages the subprocess handling encryption or decryption.
   - stdout_str (str): Captures standard output from the process.
   - stderr_str (str): Captures standard error from the process.
   - has_error (bool): Flag to track if the process encountered an error.
   - is_halted (bool): Flag to check if the process was halted by the user.

   Public Methods:
   ---------------
   - process_request(process_type: str):
     Handles the complete request for encryption or decryption of video files by initializing the process.

   - halt_process():
     Stops the currently running encryption or decryption process if it is active.

   Private/Internal Methods:
   -------------------------
   - _get_algorithm():
     Returns the corresponding CLI argument for the encryption algorithm.

   - _generate_command(process_type: str, filepath: str, hash_path: str):
     Generates the command for encryption or decryption based on the input parameters.

   - _run_subprocess(process_type: str, command: str, data: dict[str], index: int):
     Executes the subprocess for encryption/decryption and yields real-time output while managing errors and success.

   - _delete_frameGen_folder():
     Deletes the temporary folder used for frame generation in 3D-cosine encryption when the process is halted.

   - _delete_output_files(process_type: str, output_filepath: str, hash_filepath: str, time_filepath: str):
     Deletes output files if an error occurs or the process is halted.

   - _handle_error(message: str, status: str, stdout: str, stderr: str):
     Centralized error handling for process failures.

2. AnalysisProcessHandler:
   - Manages the analysis of encryption/decryption results, including resolution validation and speed metrics based on video files.

   Attributes:
   -----------
   - algorithm (str): The encryption algorithm used for the analysis (FY-Logistic or 3D-cosine).
   - orig_filepaths (dict[str]): Dictionary of original file paths for comparison with processed files.
   - processed_filepaths (dict[str]): Dictionary of processed (encrypted/decrypted) file paths.
   - time_filepaths (dict[str]): Dictionary of file paths for time analysis results.
   - output_dirpath (str): Directory path for saving analysis results.
   - input_files (list): Stores the names of input files.
   - resolutions (list): Stores the video resolutions after processing.
   - output_filepaths (list): Stores the file paths of analysis results.
   - baseline_speed_metrics (list): Stores speed metrics based on video resolution.
   - process (subprocess.Popen): Manages the subprocess for running the analysis.
   - stdout_str (str): Captures standard output from the analysis process.
   - stderr_str (str): Captures standard error from the analysis process.
   - has_error (bool): Flag to track if an error occurred during analysis.
   - is_halted (bool): Flag to check if the analysis process was halted.

   Public Methods:
   ---------------
   - process_request(process_type: str):
     Handles the request for analyzing encryption/decryption results.

   - halt_process():
     Stops the currently running analysis process if it is active.

   Private/Internal Methods:
   -------------------------
   - _get_algorithm():
     Returns the corresponding CLI argument based on the chosen algorithm.

   - _validate_video(process_type: str, processed_filepath: str, orig_filepath: str):
     Validates whether the processed video has the same resolution as the original video.

   - _get_video_info(processed_filepath: str):
     Retrieves speed metrics based on the video’s resolution for baseline analysis.

Dependencies:
-------------
- subprocess: Used to manage the execution of external CLI commands for encryption, decryption, and analysis.
- os: Provides functionality for file management, such as deleting temporary files and directories.
- shutil: For deletion of the generated folders.
- signal: For sending appropriate signals to halt the subprocess
- json: For handling the transfer of data back to the React.js frontend
- cv2: For validation of resolution.

Code Author: Charles Andre C. Bandala
"""

from fastapi import HTTPException
import os
import shutil
import signal
import sys
import subprocess
import json
import cv2

class EncryptionProcessHandler:
    def __init__(self, algorithm: str, input_filepaths: dict[str], password: str, output_dirpath: str, hash_path: str):
        # User Inputs
        self.algorithm = algorithm
        self.input_filepaths = input_filepaths
        self.password = password
        self.output_dirpath = output_dirpath
        self.hash_path = hash_path

        # Lists of values needed to be passed to the next page
        self.input_files = []
        self.output_filepaths = []
        self.time_filepaths = []

        # Subprocess
        self.process = None

        # STDOUT && STDERR
        self.stdout_str = None
        self.stderr_str = None

        # Flags
        self.has_error = False
        self.is_halted = False
    
    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        return "fisher-yates" if self.algorithm == "FY-Logistic" or self.algorithm == "fisher-yates" else "3d-cosine"
    
    def _generate_command(self, process_type: str, filepath: str, hash_path: str):
        """Generate the appropriate encryption or decryption command."""
        _base_filename, _input_file_ext = os.path.splitext(os.path.basename(filepath))
        _input_file = _base_filename + _input_file_ext

        self.algorithm = self._get_algorithm()

        def _get_unique_filepath(filepath: str):
            _base, _ext = os.path.splitext(filepath)
            _counter = 1
            _new_filepath = filepath
            while os.path.exists(_new_filepath):
                _new_filepath = f"{_base}({_counter}){_ext}"
                _counter += 1

            return _new_filepath
        
        if process_type == "encrypt":
            # Determine output path for encrypted file
            _output_filepath = os.path.join(self.output_dirpath, f"{_base_filename}_encrypted.avi") if self.output_dirpath.strip() else filepath.replace(_input_file_ext, "_encrypted.avi")
            _output_filepath = _get_unique_filepath(_output_filepath)

            # Get the output path for view file functionality
            self.output_dirpath = os.path.dirname(_output_filepath)

            # Get Hash_filepath
            _hash_filepath = os.path.join(hash_path, f"{_base_filename}.key") if hash_path.strip() else os.path.join(os.path.dirname(filepath), f"{_base_filename}.key")
            _hash_filepath = _get_unique_filepath(_hash_filepath)

            # Set a file path for the time analysis based on the hash_filepath path
            _time_filepath = os.path.join(os.path.dirname(_hash_filepath), f"{_base_filename}_encrypted_time.txt")
            _time_filepath = _get_unique_filepath(_time_filepath)

            _command = f"python -u medicrypt-cli.py encrypt -i \"{filepath}\" -o \"{_output_filepath}\" -t {self.algorithm} -k \"{_hash_filepath}\" -p {self.password} --verbose --storetime \"{_time_filepath}\""

        else:  # Decrypt
            # Determine output path for decrypted file
            _output_filepath = os.path.join(self.output_dirpath, f"{_base_filename}_decrypted.mp4") if self.output_dirpath.strip() else filepath.replace(".avi", "_decrypted.mp4")
            _output_filepath = _get_unique_filepath(_output_filepath)

            # Get the output path for view file functionality
            self.output_dirpath = os.path.dirname(_output_filepath)

            _hash_filepath = hash_path

            # Set a file path for the time analysis based on the hashpath (file path)
            _time_filepath = os.path.join(os.path.dirname(hash_path), f"{_base_filename}_decrypted_time.txt")
            _time_filepath = _get_unique_filepath(_time_filepath)

            # Generate the command itself
            _command = f"python -u medicrypt-cli.py decrypt -i \"{filepath}\" -o \"{_output_filepath}\" -t {self.algorithm} -k \"{_hash_filepath}\" -p {self.password} --verbose --storetime \"{_time_filepath}\""
        
        _data = { "input_file": _input_file, "output_filepath": _output_filepath, "hash_filepath": _hash_filepath, "time_filepath": _time_filepath }
        return _command, _data

    def _run_subprocess(self, process_type: str, command: str, data: dict[str], index: int):
        """Run the subprocess and handle real-time stdout and stderr logging."""
        try:
            _process_args = {
                'shell': True, 
                'stdout': subprocess.PIPE, 
                'stderr': subprocess.PIPE, 
                'text': True, 
                'bufsize': 1
            }

            if sys.platform.startswith('win'):
                self.process = subprocess.Popen(command, **_process_args, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            else:
                self.process = subprocess.Popen(command, **_process_args, preexec_fn=os.setsid)

            _stdout_lines, _stderr_lines = [], []
            
            for _stdout_line in iter(self.process.stdout.readline, ""):
                yield f"data: {json.dumps({'stdout': f'Video {index + 1} - {_stdout_line.strip()}', 'status': 'processing'})}\n\n"
                _stdout_lines.append(_stdout_line.strip())
            for _stderr_line in iter(self.process.stderr.readline, ""):
                yield f"data: {json.dumps({'stderr': _stderr_line.strip(), 'status': 'processing'})}\n\n"
                _stderr_lines.append(_stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            self.stdout_str = "\n".join(_stdout_lines)
            self.stderr_str = "\n".join(_stderr_lines)

            if self.process.returncode == 0:
                self.input_files.append(data['input_file'])
                self.output_filepaths.append(data['output_filepath'])
                self.time_filepaths.append(data['time_filepath'])
                
            else:
                self._delete_output_files(process_type, data['output_filepath'], data['hash_filepath'], data['time_filepath'])

                if self.is_halted:
                    yield self._handle_error('Process halted by user', 'failure', 'HALTED', self.stderr_str)

                else:
                    self.has_error = True
                    yield self._handle_error('Process encountered an issue', 'failure', self.stdout_str, self.stderr_str)
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def process_request(self, process_type: str):
        """Handle the complete request for encryption or decryption."""
        for _i, _filepath in enumerate(self.input_filepaths):
            _hash_path = self.hash_path[_i] if isinstance(self.hash_path, list) and process_type == "decrypt" else self.hash_path
            _command, _data = self._generate_command(process_type, _filepath, _hash_path)

            for out in self._run_subprocess(process_type, _command, _data, _i):
                yield out

            # Delete frameGen_folder upon halt
            if self.is_halted or self.has_error:
                if self.algorithm == "3d-cosine":
                    self._delete_frameGen_folder()
                break
        
        # Return values if there is no error
        if not (self.is_halted or self.has_error):
            yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': self.stdout_str, 'stderr': self.stderr_str, 'input_files': self.input_files, 'input_filepaths': self.input_filepaths, 'algorithm': self.algorithm, 'output_dirpath': self.output_dirpath, 'output_filepaths': self.output_filepaths, 'time_filepaths': self.time_filepaths})}\n\n"
    
    def halt_process(self):
        """A public function that handles the stopping of the current processes."""
        if self.process and self.process.poll() is None:
            # Use different signals to terminate the process depending on the platform
            if sys.platform.startswith('win'):
                self.process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                
            self.is_halted = True
            return { "message": "Process halted successfully" }
        return {"message": "No active process to halt"} 
    

    def _delete_frameGen_folder(self):
        """Handle the deletion of the frameGen_temp folder upon halt."""
        try:
            _folder_path = os.path.join(self.output_dirpath, "frameGen_temp")
            
            # Check if the frameGen_temp folder exists
            if os.path.exists(_folder_path):
                shutil.rmtree(_folder_path)  # Remove the folder and its contents
                print(f"Deleted: {_folder_path}")

            else:
                print(f"{_folder_path} does not exist.")

        except PermissionError as e:
            print(f"Permission denied: {e}")
            
        except Exception as e:
            print(f"An error occurred: {e}")
    
    def _delete_output_files(self, process_type: str, output_filepath: str, hash_filepath: str, time_filepath: str):
        """Handle the deletion of the output files upon error or halt."""
        try:
            # Delete output_filepath
            if os.path.exists(output_filepath):
                os.remove(output_filepath)
                print(f"Deleted: {output_filepath}")
            else:
                print(f"{output_filepath} does not exist.")
            
            # Delete time_filepath
            if os.path.exists(time_filepath):
                os.remove(time_filepath)
                print(f"Deleted: {time_filepath}")
            else:
                print(f"{time_filepath} does not exist.")
            
            # Delete hash_filepath only if process_type is "encrypt"
            if process_type == "encrypt":
                if os.path.exists(hash_filepath):
                    os.remove(hash_filepath)
                    print(f"Deleted: {hash_filepath}")

                else:
                    print(f"{hash_filepath} does not exist.")

        except PermissionError as e:
            print(f"Permission denied: {e}")

        except Exception as e:
            print(f"An error occurred: {e}")
        
    def _handle_error(self, message: str, status: str, stdout:str, stderr:str):
        """Centralized error handling method."""
        self.has_error = True
        _error_response = {
            'message': message,
            'status': status,
            'stdout': stdout,
            'stderr': stderr
        }
        return f"data: {json.dumps(_error_response)}\n\n"

class AnalysisProcessHandler:
    def __init__(self, algorithm: str, orig_filepaths: dict[str], processed_filepaths: dict[str], time_filepaths: dict[str], output_dirpath: str) -> None:
        # User Inputs
        self.algorithm = algorithm
        self.orig_filepaths = orig_filepaths
        self.processed_filepaths = processed_filepaths
        self.time_filepaths = time_filepaths
        self.output_dirpath = output_dirpath

        # List for outputs
        self.input_files = []
        self.resolutions = []
        self.output_filepaths = []
        self.baseline_speed_metrics = []

        # Subprocess
        self.process = None
        
        # STDOUT && STDERR
        self.stdout_str = None
        self.stderr_str = None

        # Flags
        self.has_error = False
        self.is_halted = False
    
    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        return "fisher-yates" if self.algorithm == "FY-Logistic" or self.algorithm == "fisher-yates" else "3d-cosine"
    
    def _validate_video(self, process_type:str, processed_filepath: str, orig_filepath: str):
        """Validate whether the processed video has the same resolution with the original video"""
        _orig_cap = cv2.VideoCapture(orig_filepath)
        if not _orig_cap.isOpened():
            self._handle_error(f"Error opening original video file: {orig_filepath}")
            return False

        _processed_cap = cv2.VideoCapture(processed_filepath)
        if not _processed_cap.isOpened():
            self._handle_error(f"Error opening processed video file: {processed_filepath}")
            return False

        _orig_width, _orig_height = int(_orig_cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(_orig_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        _processed_width, _processed_height = int(_processed_cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(_processed_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        _orig_cap.release()
        _processed_cap.release()

        return _orig_width == _processed_width and _orig_height == _processed_height or process_type == "encrypt"

    def _get_video_info(self, processed_filepath: str):
        """Get the baseline speed for the given filepath based on closest resolution from reference table"""
        
        # Define the reference table for AES performance across resolutions
        _reference_table = {
            (320, 240): [30.2, 26.5, 30.1],    
            (720, 576): [273, 216, 272],     
            (1280, 720): [282, 253, 281],       
            (1920, 1080): [538, 510, 540],     
            (3840, 2160): [2531, 2339, 2530]
        }

        _processed_cap = cv2.VideoCapture(processed_filepath)
        
        if not _processed_cap.isOpened():
            self._handle_error(f"Error opening processed video file: {processed_filepath}")
            return None

        _processed_width = int(_processed_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        _processed_height = int(_processed_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        _processed_cap.release()

        _lookup_width = max(_processed_width, _processed_height)
        _lookup_height = min(_processed_width, _processed_height)

        closest_resolution = min(_reference_table.keys(), key=lambda res: (res[0] - _lookup_width)**2 + (res[1] - _lookup_height)**2)

        return _reference_table[closest_resolution], [_processed_width, _processed_height]

    def _generate_command(self, process_type: str, orig_filepath: str, processed_filepath: str, time_filepath: str):
        """Generate the appropriate analysis-cli.py command for either encryption or decryption evaluation."""
        # Necessary variables for output
        _base_processed_filename, _input_file_ext = os.path.splitext(os.path.basename(processed_filepath))
        _input_file = _base_processed_filename + _input_file_ext

        def _get_unique_filepath(filepath: str):
            _base, _ext = os.path.splitext(filepath)
            _counter = 1
            _new_filepath = filepath
            while os.path.exists(_new_filepath):
                _new_filepath = f"{_base}({_counter}){_ext}"
                _counter += 1

            return _new_filepath

        # Set an output file path for the .csv file. 
        _output_filepath = os.path.join(self.output_dirpath, f"{_base_processed_filename}_analytics.csv")
        _output_filepath = _get_unique_filepath(_output_filepath)

        if process_type == "encrypt":
            _command = f"python -u analysis-cli.py -o \"{orig_filepath}\" -e \"{processed_filepath}\" -p 12345 -m encryption -w \"{_output_filepath}\" -t {self.algorithm} --etime \"{time_filepath}\" --verbose"

        else:
            _command = f"python -u analysis-cli.py -o \"{orig_filepath}\" -d \"{processed_filepath}\" -p 12345 -m psnr -w \"{_output_filepath}\" -t {self.algorithm} --dtime \"{time_filepath}\" --verbose"

        _baseline_speed, _resolution = self._get_video_info(processed_filepath)
        _data = { "input_file": _input_file, "resolution": _resolution, "output_filepath": _output_filepath, "baseline_speed": _baseline_speed}
        return _command, _data

    def _run_subprocess(self, command: str, data: dict, index: int):
        """Run the command using a subprocess."""
        try:
            _process_args = {
                'shell': True, 
                'stdout': subprocess.PIPE, 
                'stderr': subprocess.PIPE, 
                'text': True, 
                'bufsize': 1
            }
            if sys.platform.startswith('win'):
                self.process = subprocess.Popen(command, **_process_args, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            else:
                self.process = subprocess.Popen(command, **_process_args, preexec_fn=os.setsid)

            _stdout_lines, _stderr_lines= [],[]
    
            # Stream stdout
            for _stdout_line in iter(self.process.stdout.readline, ""):
                _curr_output = f"Video {index + 1} - {_stdout_line.strip()}"
                yield f"data: {json.dumps({'stdout': _curr_output, 'status': 'processing'})}\n\n"
                _stdout_lines.append(_stdout_line.strip())

            # Stream stderr
            for _stderr_line in iter(self.process.stderr.readline, ""):
                yield f"data: {json.dumps({'stderr': _stderr_line.strip(), 'status': 'processing'})}\n\n"
                _stderr_lines.append(_stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            self.stdout_str = "\n".join(_stdout_lines)
            self.stderr_str = "\n".join(_stderr_lines)

            if self.process.returncode == 0:
                self.input_files.append(data['input_file'])
                self.resolutions.append(data['resolution'])
                self.output_filepaths.append(data['output_filepath'])
                self.baseline_speed_metrics.append(data['baseline_speed'])
                
            else:
                self._delete_output_files(data['output_filepath'])

                if self.is_halted:
                    yield self._handle_error('Process halted by user', 'failure', 'HALTED', self.stderr_str)

                else:
                    self.has_error = True
                    yield self._handle_error('Process encountered an issue', 'failure', self.stdout_str, self.stderr_str)
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def process_request(self, process_type: str):
        """Handle the complete request for analysis of encryption or decryption."""
        for _i, _filepath in enumerate(self.processed_filepaths):
            _orig_filepath = self.orig_filepaths[_i]
            _time_filepath = self.time_filepaths[_i]
            _command, _data = self._generate_command(process_type, _orig_filepath, _filepath, _time_filepath)

            for out in self._run_subprocess(_command, _data, _i):
                yield out

            if self.is_halted or self.has_error:
                break

        if not (self.is_halted or self.has_error):
            yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': self.stdout_str, 'stderr': self.stderr_str, 'input_files': self.input_files, 'resolutions': self.resolutions, 'algorithm': self.algorithm, 'output_dirpath': self.output_dirpath, 'output_filepaths': self.output_filepaths, 'baseline_speed_metrics': self.baseline_speed_metrics})}\n\n"
    
    def halt_process(self):
        """A public function that handles the stopping of the current processes."""
        if self.process and self.process.poll() is None:
            # Use different signals to terminate the process depending on the platform
            if sys.platform.startswith('win'):
                self.process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                
            self.is_halted = True
            return { "message": "Process halted successfully" }
        return {"message": "No active process to halt"} 
    
    def _delete_output_files(self, output_filepath: str):
        """Handle the deletion of the output files upon error or halt."""
        try:
            # Delete output_filepath
            if os.path.exists(output_filepath):
                os.remove(output_filepath)
                print(f"Deleted: {output_filepath}")

            else:
                print(f"{output_filepath} does not exist.")

        except PermissionError as e:
            print(f"Permission denied: {e}")
            
        except Exception as e:
            print(f"An error occurred: {e}")
    
    def _handle_error(self, message: str, status: str, stdout:str, stderr:str):
        """Centralized error handling method."""
        self.has_error = True
        _error_response = {
            'message': message,
            'status': status,
            'stdout': stdout,
            'stderr': stderr
        }
        return f"data: {json.dumps(_error_response)}\n\n"