"""
This module provides the class `AnalysisProcessHandler` to manage analysis processes 
for encryption/decryption results. This class handles file inputs, manages subprocesses, and handles errors and halting of processes.

Class:
------
1. AnalysisProcessHandler:
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
- subprocess: Used to manage the execution of external CLI commands for analysis.
- os: Provides functionality for file management, such as deleting temporary files and directories.
- shutil: For deletion of the generated folders.
- signal: For sending appropriate signals to halt the subprocess.
- json: For handling the transfer of data back to the React.js frontend.
- cv2: For validation of resolution.

Code Author: Charles Andre C. Bandala
Date Created: 10/2/2024
Last Modified: 11/11/2024
"""

from fastapi import HTTPException
import os
import signal
import sys
import subprocess
import json
import cv2

class AnalysisProcessHandler:
    def __init__(
            self, 
            algorithm: str, 
            orig_filepaths: dict[str], 
            processed_filepaths: dict[str], 
            time_filepaths: dict[str], 
            output_dirpath: str
        ):

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
        if self.algorithm in ["FY-Logistic", "fisher-yates"]:
            return "fisher-yates"

        else:
            return "3d-cosine"
    
    def _validate_video(
            self, 
            process_type:str, 
            processed_filepath: 
            str, 
            orig_filepath: str
        ):
        """Validate whether the processed video has the same resolution with the original video"""
        _orig_cap = cv2.VideoCapture(orig_filepath)

        if not _orig_cap.isOpened():
            _err_str = f"Error opening original video file: {orig_filepath}"
            self._handle_error(_err_str)
            return False

        _processed_cap = cv2.VideoCapture(processed_filepath)
        if not _processed_cap.isOpened():
            _err_str = f"Error opening processed video file: {processed_filepath}"
            self._handle_error(_err_str)
            return False

        _orig_width = int(_orig_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        _orig_height = int(_orig_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        _processed_width = int(_processed_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        _processed_height = int(_processed_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        _orig_cap.release()
        _processed_cap.release()
        
        # Returns true if resolutions are similar or if process_type is encrypt.
        if process_type == "encrypt":
            return True  
        
        else:
            _width_check = _orig_width == _processed_width
            _height_check = _orig_height == _processed_height
            return _width_check and _height_check

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
            _err_str = f"Error opening processed video file: {processed_filepath}"
            self._handle_error(_err_str)
            return None

        _processed_width = int(_processed_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        _processed_height = int(_processed_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        _processed_cap.release()

        _lookup_width = max(_processed_width, _processed_height)
        _lookup_height = min(_processed_width, _processed_height)

        _closest_resolution = min(
                                _reference_table.keys(), 
                                key=lambda res: 
                                    (res[0] - _lookup_width)**2 + (res[1] - _lookup_height)**2
                            )
        
        _close_res = _reference_table[_closest_resolution]
        _proc_res = [_processed_width, _processed_height]
        return _close_res, _proc_res 

    def _generate_command(
            self, 
            process_type: str, 
            orig_filepath: str, 
            processed_filepath: str, 
            time_filepath: str
        ):
        """Generate the appropriate analysis-cli.py command for either encryption or decryption evaluation."""
        # Necessary variables for output
        _base_filename, _input_file_ext = os.path.splitext(
                                            os.path.basename(processed_filepath)
                                        )
        _input_file = _base_filename + _input_file_ext

        def _get_unique_filepath(filepath: str):
            _base, _ext = os.path.splitext(filepath)
            _counter = 1
            _new_filepath = filepath
            while os.path.exists(_new_filepath):
                _new_filepath = f"{_base}({_counter}){_ext}"
                _counter += 1

            return _new_filepath

        # Set an output file path for the .csv file. 
        _output_filepath = os.path.join(
                            self.output_dirpath, 
                            f"{_base_filename}_analytics.csv"
                        )
        _output_filepath = _get_unique_filepath(_output_filepath)

        if process_type == "encrypt":
            _command = f"python -u analysis-cli.py -o \"{orig_filepath}\" -e \"{processed_filepath}\" -m encryption -w \"{_output_filepath}\" -t {self.algorithm} --etime \"{time_filepath}\" --verbose"

        else:
            _command = f"python -u analysis-cli.py -o \"{orig_filepath}\" -d \"{processed_filepath}\" -m psnr -w \"{_output_filepath}\" -t {self.algorithm} --dtime \"{time_filepath}\" --verbose"

        _video_info = self._get_video_info(processed_filepath)
        _baseline_speed = _video_info[0]
        _resolution = _video_info[1]
        _data = { 
                    "input_file": _input_file, 
                    "resolution": _resolution, 
                    "output_filepath": _output_filepath, 
                    "baseline_speed": _baseline_speed
                }
        return _command, _data

    def _run_subprocess(
            self, 
            command: str, 
            data: dict, 
            index: int
        ):
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
                self.process = subprocess.Popen(
                    command, **_process_args, 
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                )

            else:
                self.process = subprocess.Popen(
                    command, 
                    **_process_args, 
                    preexec_fn=os.setsid
                )

            _stdout_lines, _stderr_lines= [],[]
    
            # Stream stdout
            for _stdout_line in iter(self.process.stdout.readline, ""):
                _curr_output = f"Video {index + 1} - {_stdout_line.strip()}"
                _stdout_data = {'stdout': _curr_output, 'status': 'processing'}
                yield f"data: {json.dumps(_stdout_data)}\n\n"
                _stdout_lines.append(_stdout_line.strip())

            # Stream stderr
            for _stderr_line in iter(self.process.stderr.readline, ""):
                _stderr_data = {'stderr': _stderr_line.strip(), 'status': 'processing'}
                yield f"data: {json.dumps(_stderr_data)}\n\n"
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
                    yield self._handle_error(
                        'Process halted by user', 
                        'failure', 
                        self.stdout_str, 'HALTED'
                    )

                else:
                    self.has_error = True
                    yield self._handle_error(
                        'Process encountered an issue', 
                        'failure', 
                        self.stdout_str, 
                        self.stderr_str
                    )
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def process_request(self, process_type: str):
        """Handle the complete request for analysis of encryption or decryption."""
        for _i, _filepath in enumerate(self.processed_filepaths):
            _orig_filepath = self.orig_filepaths[_i]
            _time_filepath = self.time_filepaths[_i]
            
            _validate_vid = self._validate_video(
                                process_type, 
                                _filepath, 
                                _orig_filepath
                            )
            if _validate_vid == True:
                _command, _data = self._generate_command(
                                    process_type, 
                                    _orig_filepath, 
                                    _filepath, 
                                    _time_filepath
                                )
                
                for out in self._run_subprocess(
                                _command, 
                                _data, 
                                _i
                            ):
                    yield out

                if self.is_halted or self.has_error:
                    break
            
            else:
                yield self._handle_error(
                    'Unable to proceed with analysis', 
                    'failure', 
                    "None\n", 
                    'MISMATCH RESOLUTION'
                )

        if not (self.is_halted or self.has_error):
            _ret_data = {
                            'message': 'Process completed', 
                            'status': 'success', 
                            'stdout': self.stdout_str, 
                            'stderr': self.stderr_str, 
                            'input_files': self.input_files, 
                            'resolutions': self.resolutions, 
                            'algorithm': self.algorithm, 
                            'output_dirpath': self.output_dirpath, 
                            'output_filepaths': self.output_filepaths, 
                            'baseline_speed_metrics': self.baseline_speed_metrics
                        }
            yield f"data: {json.dumps(_ret_data)}\n\n"
    
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