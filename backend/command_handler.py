from fastapi import HTTPException
import os
import signal
import sys
import subprocess
import json
import cv2

class EncryptionCommandHandler:
    def __init__(self, algorithm: str, filepath: dict[str], password: str, outputpath: str, hashpath: str):
        # User Inputs
        self.algorithm = algorithm
        self.filepath = filepath
        self.password = password
        self.outputpath = outputpath
        self.hashpath = hashpath

        self.inputfile_list = []
        self.inputfilepath_list = []
        self.outputfilepath_list = []
        self.timefilepath_list = []

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

    def _generate_command(self, process_type: str, filepath: str, current_hashpath: str):
        # Necessary variables for output
        base_filename = os.path.splitext(os.path.basename(filepath))[0]
        inputfile_ext = os.path.splitext(os.path.basename(filepath))[1].lower()
        inputfile = base_filename + inputfile_ext
        outputfilepath = None
        timefilepath = None

        """Generate the appropriate encryption or decryption command."""
        self.algorithm = self._get_algorithm()
        
        def get_unique_filepath(filepath):
            base, ext = os.path.splitext(filepath)
            counter = 1
            new_filepath = filepath
            while os.path.exists(new_filepath):
                new_filepath = f"{base}({counter}){ext}"
                counter += 1
            return new_filepath

        if process_type == "encrypt":
            # Determine output path for encrypted file
            if self.outputpath and self.outputpath.strip():
                outputfilepath = os.path.join(self.outputpath, f"{base_filename}_encrypted.avi")
                
            else:
                outputfilepath = filepath.replace(inputfile_ext, "_encrypted.avi")

            outputfilepath = get_unique_filepath(outputfilepath)

            # Get the output path for view file functionality
            self.outputpath = os.path.dirname(outputfilepath)

            if current_hashpath and current_hashpath.strip():
                hashfilepath = os.path.join(current_hashpath, f"{base_filename}.key")

            else:
                hashfilepath = os.path.join(os.path.dirname(filepath), f"{base_filename}.key")

            hashfilepath = get_unique_filepath(hashfilepath)

            # Set a file path for the time analysis based on the hashfilepath path
            hashpath_dir = os.path.dirname(hashfilepath)
            timefilepath = os.path.join(hashpath_dir, f"{base_filename}_encrypted_time.txt")
            timefilepath = get_unique_filepath(timefilepath)

            command = f"python -u medicrypt-cli.py encrypt -i {filepath} -o {outputfilepath} -t {self.algorithm} -k {hashfilepath} -p {self.password} --verbose --storetime {timefilepath}"
        
        else:  # Decrypt
            # Determine output path for decrypted file
            if self.outputpath and self.outputpath.strip():
                outputfilepath = os.path.join(self.outputpath, f"{base_filename}_decrypted.avi")
                
            else:
                outputfilepath = filepath.replace(".avi", "_decrypted.avi")

            outputfilepath = get_unique_filepath(outputfilepath)

            # Get the output path for view file functionality
            self.outputpath = os.path.dirname(outputfilepath)

            hashfilepath = current_hashpath

            # Set a file path for the time analysis based on the hashpath (file path)
            hashpath_dir = os.path.dirname(hashfilepath)
            timefilepath = os.path.join(hashpath_dir, f"{base_filename}_decrypted_time.txt")
            timefilepath = get_unique_filepath(timefilepath)

            # Generate the command itself
            command = f"python -u medicrypt-cli.py decrypt -i {filepath} -o {outputfilepath} -t {self.algorithm} -k {hashfilepath} -p {self.password} --verbose --storetime {timefilepath}"
        
        data = { "inputfile": inputfile, "inputfilepath": filepath, "outputfilepath": outputfilepath, "hashfilepath": hashfilepath, "timefilepath": timefilepath }
        return command, data

    def _run_subprocess(self, process_type: str, command: str, data: dict, index: int):
        """Run the subprocess and handle real-time stdout and stderr logging."""
        try:
            # Use different process creation flags depending on the platform
            if sys.platform.startswith('win'):
                self.process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            else:
                self.process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1, preexec_fn=os.setsid)

            stdout_lines = []
            stderr_lines = []

            # Stream stdout
            for stdout_line in iter(self.process.stdout.readline, ""):
                curr_output = f"Video {index + 1} - {stdout_line.strip()}"
                yield f"data: {json.dumps({'stdout': curr_output, 'status': 'processing'})}\n\n"
                stdout_lines.append(stdout_line.strip())

            # Stream stderr
            for stderr_line in iter(self.process.stderr.readline, ""):
                yield f"data: {json.dumps({'stderr': stderr_line.strip(), 'status': 'processing'})}\n\n"
                stderr_lines.append(stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            self.stdout_str = "\n".join(stdout_lines)
            self.stderr_str = "\n".join(stderr_lines)
            inputfile = data['inputfile']
            inputfilepath = data['inputfilepath']
            outputfilepath = data['outputfilepath']
            hashfilepath = data['hashfilepath']
            timefilepath = data['timefilepath']

            if self.process.returncode == 0:
                self.inputfile_list.append(inputfile)
                self.inputfilepath_list.append(inputfilepath)
                self.outputfilepath_list.append(outputfilepath)
                self.timefilepath_list.append(timefilepath)
                
            else:
                self._delete_output_files(process_type, outputfilepath, hashfilepath, timefilepath)

                if self.is_halted:
                    yield f"data: {json.dumps({'message': 'Process halted by user request.', 'status': 'failure', 'stdout': 'HALTED', 'stderr': self.stderr_str})}\n\n"

                else:
                    self.has_error = True
                    yield f"data: {json.dumps({'message': 'Process encountered an issue', 'status': 'failure', 'stdout': self.stdout_str, 'stderr': self.stderr_str})}\n\n"
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def process_request(self, process_type: str):
        """Handle the complete request for encryption or decryption."""
        i = 0  
        while i < len(self.filepath):
            filepath = self.filepath[i]

            # Check if hashpath is a list (for decryption) and handle it
            if isinstance(self.hashpath, list) and process_type == "decrypt":
                current_hashpath = self.hashpath[i]

            else:
                current_hashpath = self.hashpath  # Use the string hashpath for encryption

            # Generate the command based on process type (encrypt or decrypt)
            command, data = self._generate_command(process_type, filepath, current_hashpath)
            subprocess = self._run_subprocess(process_type, command, data, i)

            # Stream the output from the subprocess
            for out in subprocess:
                yield out

            # Check if the process was halted or encountered an error
            if self.is_halted or self.has_error:
                break

            i += 1 

        # If not halted or with errors, send success message
        if not (self.is_halted or self.has_error):
            inputfile = self.inputfile_list
            inputfilepath = self.inputfilepath_list
            outputfilepath = self.outputfilepath_list
            timefilepath = self.timefilepath_list
            yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': self.stdout_str, 'stderr': self.stderr_str, 'inputfile': inputfile, 'inputfilepath': inputfilepath, 'algorithm': self.algorithm, 'outputpath': self.outputpath, 'outputfilepath': outputfilepath, 'timefilepath': timefilepath})}\n\n"
    
    def halt_process(self):
        """Handle the stopping of the current processes."""
        if self.process and self.process.poll() is None:
            # Use different signals to terminate the process depending on the platform
            if sys.platform.startswith('win'):
                self.process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                
            self.is_halted = True
            return { "message": "Process halted successfully" }
        return {"message": "No active process to halt"} 

    def _delete_output_files(self, process_type: str, outputfilepath: str, hashfilepath: str, timefilepath: str):
        """Handle the deletion of the output files upon error or halt."""
        try:
            # Delete outputfilepath
            if os.path.exists(outputfilepath):
                os.remove(outputfilepath)
                print(f"Deleted: {outputfilepath}")
            else:
                print(f"{outputfilepath} does not exist.")
            
            # Delete timefilepath
            if os.path.exists(timefilepath):
                os.remove(timefilepath)
                print(f"Deleted: {timefilepath}")
            else:
                print(f"{timefilepath} does not exist.")
            
            # Delete hashfilepath only if process_type is "encrypt"
            if process_type == "encrypt":
                if os.path.exists(hashfilepath):
                    os.remove(hashfilepath)
                    print(f"Deleted: {hashfilepath}")

                else:
                    print(f"{hashfilepath} does not exist.")

        except PermissionError as e:
            print(f"Permission denied: {e}")

        except Exception as e:
            print(f"An error occurred: {e}")

class AnalysisCommandHandler:
    def __init__(self, algorithm: str, origfilepath: dict[str], processedfilepath: dict[str], timefilepath: dict[str], outputpath:str) -> None:
        # User Inputs
        self.algorithm = algorithm
        self.origfilepath = origfilepath
        self.processedfilepath = processedfilepath
        self.timefilepath = timefilepath
        self.outputpath = outputpath

        # List for outputs
        self.inputfile_list = []
        self.outputfilepath_list = []
        self.baselinespeed_list = []

        # Subprocess
        self.process = None
        
        # STDOUT && STDERR
        self.stdout_str = None
        self.stderr_str = None

        # Flags
        self.has_error = False
        self.is_halted = False
    
    def _validate_video(self, current_processedfilepath: str, current_origfilepath: str):
        """Validate whether the processed video has the same resolution with the original video"""
        orig_cap = cv2.VideoCapture(current_origfilepath)
        if not orig_cap.isOpened():
            self._handle_error(f"Error opening original video file: {current_origfilepath}")
            return False

        processed_cap = cv2.VideoCapture(current_processedfilepath)
        if not processed_cap.isOpened():
            self._handle_error(f"Error opening processed video file: {current_processedfilepath}")
            return False

        orig_width = int(orig_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        orig_height = int(orig_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        processed_width = int(processed_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        processed_height = int(processed_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        orig_cap.release()
        processed_cap.release()

        # Compare resolutions
        if orig_width == processed_width and orig_height == processed_height:
            return True
        else:
            self._handle_error(
                f"Resolution mismatch: Original video is {orig_width}x{orig_height}, Processed video is {processed_width}x{processed_height}.",
                'failure',
                self.stdout_str, self.stderr_str
            )

        return False

    def _get_baseline_speed(self, current_processedfilepath: str):
        """Get the baseline speed for the given filepath based on closest resolution from reference table"""
        
        # Define the reference table for AES performance across resolutions
        reference_table = {
            (320, 240): [30.2, 26.5, 30.1],    
            (720, 576): [273, 216, 272],      
            (1280, 720): [282, 253, 281],      
            (1920, 1080): [538, 510, 540],     
            (3840, 2160): [2531, 2339, 2530]
        }

        # Open the processed video file to get its resolution
        processed_cap = cv2.VideoCapture(current_processedfilepath)
        if not processed_cap.isOpened():
            self._handle_error(f"Error opening processed video file: {current_processedfilepath}")
            return None

        processed_width = int(processed_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        processed_height = int(processed_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        processed_cap.release()

        closest_resolution = min(reference_table.keys(), key=lambda res: (res[0] - processed_width)**2 + (res[1] - processed_height)**2)

        return reference_table[closest_resolution]

    def _generate_command(self, process_type: str, current_origfilepath: str, current_processedfilepath: str, current_timefilepath: str):
        """Generate the appropriate analysis-cli.py command for either encryption or decryption evaluation."""
        # Necessary variables for output
        base_processedfilename = os.path.splitext(os.path.basename(current_processedfilepath))[0]
        inputfile_ext = os.path.splitext(os.path.basename(current_processedfilepath))[1].lower()
        inputfile = base_processedfilename + inputfile_ext
        outputfilepath = None

        def get_unique_filepath(filepath):
            base, ext = os.path.splitext(filepath)
            counter = 1
            new_filepath = filepath
            while os.path.exists(new_filepath):
                new_filepath = f"{base}({counter}){ext}"
                counter += 1
            return new_filepath

        # Set an output file path for the .csv file. 
        outputfilepath = os.path.join(self.outputpath, f"{base_processedfilename}_analytics.csv")
        outputfilepath = get_unique_filepath(outputfilepath)

        if process_type == "encrypt":
            command = f"python -u analysis-cli.py -o {current_origfilepath} -e {current_processedfilepath} -p 12345 -m encryption -w {outputfilepath} -t {self.algorithm} --etime {current_timefilepath} --verbose"

        else:
            command = f"python -u analysis-cli.py -o {current_origfilepath} -d {current_processedfilepath} -p 12345 -m psnr -w {outputfilepath} -t {self.algorithm} --dtime {current_timefilepath} --verbose"

        baselinespeed = self._get_baseline_speed(current_processedfilepath)
        data = { "inputfile": inputfile, "outputfilepath": outputfilepath, "baselinespeed": baselinespeed }
        return command, data

    def _run_subprocess(self, command: str, data: dict, index: int):
        """Run the command using a subprocess."""
        try:
            # Use different process creation flags depending on the platform
            if sys.platform.startswith('win'):
                self.process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            else:
                self.process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1, preexec_fn=os.setsid)

            stdout_lines = []
            stderr_lines = []
    
            # Stream stdout
            for stdout_line in iter(self.process.stdout.readline, ""):
                curr_output = f"Video {index + 1} - {stdout_line.strip()}"
                yield f"data: {json.dumps({'stdout': curr_output, 'status': 'processing'})}\n\n"
                stdout_lines.append(stdout_line.strip())

            # Stream stderr
            for stderr_line in iter(self.process.stderr.readline, ""):
                yield f"data: {json.dumps({'stderr': stderr_line.strip(), 'status': 'processing'})}\n\n"
                stderr_lines.append(stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            self.stdout_str = "\n".join(stdout_lines)
            self.stderr_str = "\n".join(stderr_lines)
            inputfile = data['inputfile']
            outputfilepath = data['outputfilepath']
            baselinespeed = data['baselinespeed']

            if self.process.returncode == 0:
                self.inputfile_list.append(inputfile)
                self.outputfilepath_list.append(outputfilepath)
                self.baselinespeed_list.append(baselinespeed)
                
            else:
                self._delete_output_files(outputfilepath)

                if self.is_halted:
                    yield f"data: {json.dumps({'message': 'Process halted by user request.', 'status': 'failure', 'stdout': 'HALTED', 'stderr': self.stderr_str})}\n\n"

                else:
                    self.has_error = True
                    yield self._handle_error('Process encountered an issue', 'failure', self.stdout_str, self.stderr_str, command)
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def process_request(self, process_type: str):
        """Handle the complete request for analysis of encryption or decryption."""
        i = 0
        while i < len(self.processedfilepath):
            # Access current files
            origfilepath = self.origfilepath[i]
            processedfilepath = self.processedfilepath[i]
            timefilepath = self.timefilepath[i]

            # Generate Command and Data for Outputs
            command, data = self._generate_command(process_type, origfilepath, processedfilepath, timefilepath)

            # Validate video before processing
            if not self._validate_video(processedfilepath, origfilepath):
                self.has_error = True
                yield self._handle_error('Video validation failed', 'failure', 'MISMATCH VIDEO RESOLUTION', self.stderr_str, command)
                break

            # Run Subprocess
            subprocess = self._run_subprocess(command, data, i)

            for out in subprocess:
                yield out
            
            # Check if the process was halted or encountered an error
            if self.is_halted or self.has_error:
                break

            i += 1 

        # Return if no error occured
        if not (self.is_halted or self.has_error):
            inputfile = self.inputfile_list
            outputfilepath = self.outputfilepath_list
            baselinespeed = self.baselinespeed_list
            yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': self.stdout_str, 'stderr': self.stderr_str, 'algorithm': self.algorithm, 'inputfile': inputfile, 'outputpath': self.outputpath, 'outputfilepath': outputfilepath, 'baselinespeed': baselinespeed})}\n\n"
    
    def halt_process(self):
        """Handle the stopping of the current processes."""
        if self.process and self.process.poll() is None:
            # Use different signals to terminate the process depending on the platform
            if sys.platform.startswith('win'):
                self.process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                
            self.is_halted = True
            return { "message": "Process halted successfully" }
        return {"message": "No active process to halt"}   

    def _delete_output_files(self, outputfilepath: str):
        """Handle the deletion of the output files upon error or halt."""
        try:
            # Delete outputfilepath
            if os.path.exists(outputfilepath):
                os.remove(outputfilepath)
                print(f"Deleted: {outputfilepath}")

            else:
                print(f"{outputfilepath} does not exist.")

        except PermissionError as e:
            print(f"Permission denied: {e}")
            
        except Exception as e:
            print(f"An error occurred: {e}")

    def _handle_error(self, message: str, status: str, stdout:str, stderr:str, command: str = None):
        """Centralized error handling method."""
        self.has_error = True
        error_response = {
            'message': message,
            'status': status,
            'stdout': self.stdout_str,
            'stderr': self.stderr_str
        }
        if command:
            error_response['command'] = command
        return f"data: {json.dumps(error_response)}\n\n"