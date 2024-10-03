from fastapi import HTTPException
import os
import signal
import sys
import subprocess
import json

class EncryptionCommandHandler:
    def __init__(self, algorithm: str, filepath: str, password: str, outputpath: str, hashpath: str):
        # User Inputs
        self.algorithm = algorithm
        self.filepath = filepath
        self.password = password
        self.outputpath = outputpath
        self.hashpath = hashpath
        
        # Necessary variables for output
        self.base_filename = os.path.splitext(os.path.basename(self.filepath))[0]
        self.inputfile_ext = os.path.splitext(os.path.basename(self.filepath))[1].lower()
        self.outputfilepath = None
        self.timefilepath = None

        # Subprocess
        self.process = None

        # Flags
        self.is_halted = False

    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        return "fisher-yates" if self.algorithm == "FY-Logistic" else "3d-cosine"

    def _generate_command(self, process_type: str):
        """Generate the appropriate encryption or decryption command."""
        self.algorithm = self._get_algorithm()
        
        # Helper function to check if the file exists and append a number if necessary
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
                self.outputfilepath = os.path.join(self.outputpath, f"{self.base_filename}_encrypted.avi")
                
            else:
                # Replace the original file extension with '_encrypted.avi'
                self.outputfilepath = self.filepath.replace(self.inputfile_ext, "_encrypted.avi")

            # Ensure the output filepath is unique
            self.outputfilepath = get_unique_filepath(self.outputfilepath)

            # Handle hashpath only for encryption, and fall back to filepath's directory
            if self.hashpath and self.hashpath.strip():
                key_file = os.path.join(self.hashpath, f"{self.base_filename}.key")

            else:
                key_file = os.path.join(os.path.dirname(self.filepath), f"{self.base_filename}.key")

            # Ensure the key file path is unique
            key_file = get_unique_filepath(key_file)

            # Set a file path for the time analysis based on the key_file path
            # Get the directory of the hashpath file and create the time file there
            hashpath_dir = os.path.dirname(key_file)
            self.timefilepath = os.path.join(hashpath_dir, f"{self.base_filename}_encrypted_time.txt")
            self.timefilepath = get_unique_filepath(self.timefilepath)

            # Generate the command itself
            command = f"python -u medicrypt-cli.py encrypt -i {self.filepath} -o {self.outputfilepath} -t {self.algorithm} -k {key_file} -p {self.password} --verbose --storetime {self.timefilepath}"
        
        else:  # Decrypt
            # Determine output path for decrypted file
            if self.outputpath and self.outputpath.strip():
                self.outputfilepath = os.path.join(self.outputpath, f"{self.base_filename}_decrypted.avi")
                
            else:
                self.outputfilepath = self.filepath.replace(".avi", "_decrypted.avi")

            # Ensure the output filepath is unique
            self.outputfilepath = get_unique_filepath(self.outputfilepath)

            # Set a file path for the time analysis based on the hashpath (file path)
            # Get the directory of the hashpath file and create the time file there
            hashpath_dir = os.path.dirname(self.hashpath)
            self.timefilepath = os.path.join(hashpath_dir, f"{self.base_filename}_decrypted_time.txt")
            self.timefilepath = get_unique_filepath(self.timefilepath)

            # Generate the command itself
            command = f"python -u medicrypt-cli.py decrypt -i {self.filepath} -o {self.outputfilepath} -t {self.algorithm} -k {self.hashpath} -p {self.password} --verbose --storetime {self.timefilepath}"
        
        return command

    def _run_subprocess(self, command: str):
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
                yield f"data: {json.dumps({'stdout': stdout_line.strip(), 'status': 'processing'})}\n\n"
                stdout_lines.append(stdout_line.strip())

            # Stream stderr
            for stderr_line in iter(self.process.stderr.readline, ""):
                yield f"data: {json.dumps({'stderr': stderr_line.strip(), 'status': 'processing'})}\n\n"
                stderr_lines.append(stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            stdout_str = "\n".join(stdout_lines)
            stderr_str = "\n".join(stderr_lines)
            inputfile = self.base_filename + self.inputfile_ext
            inputfilepath = self.filepath
            algorithm = self.algorithm
            outputfilepath = self.outputfilepath
            timefilepath = self.timefilepath

            if self.process.returncode == 0:
                yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': stdout_str, 'stderr': stderr_str, 'inputfile': inputfile, 'inputfilepath': inputfilepath, 'algorithm': algorithm, 'outputfilepath': outputfilepath, 'timefilepath': timefilepath})}\n\n"
                
            else:
                if self.is_halted:
                    yield f"data: {json.dumps({'message': 'Process halted by user request.', 'status': 'failure', 'stdout': 'HALTED', 'stderr': stderr_str})}\n\n"

                else:
                    yield f"data: {json.dumps({'message': 'Process encountered an issue', 'status': 'failure', 'stdout': stdout_str, 'stderr': stderr_str})}\n\n"
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def process_request(self, process_type: str):
        """Handle the complete request for encryption or decryption."""
        command = self._generate_command(process_type)
        subprocess = self._run_subprocess(command)

        for out in subprocess:
            yield out

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

class AnalysisCommandHandler:
    def __init__(self, algorithm: str, origfilepath: str, processedfilepath: str, timefilepath:str, outputpath:str) -> None:
        # User Inputs
        self.algorithm = algorithm
        self.origfilepath = origfilepath
        self.processedfilepath = processedfilepath
        self.timefilepath = timefilepath
        self.outputpath = outputpath

        # Necessary variables for output
        self.base_processedfilename = os.path.splitext(os.path.basename(self.processedfilepath))[0]
        self.inputfile_ext = os.path.splitext(os.path.basename(self.processedfilepath))[1].lower()
        self.outputfilepath = None

        # Subprocess
        self.process = None
        
        # Flags
        self.is_halted = False

    def _generate_command(self, process_type: str):
        """Generate the appropriate analysis-cli.py command for either encryption or decryption evaluation."""

        # Helper function to check if the file exists and append a number if necessary
        def get_unique_filepath(filepath):
            base, ext = os.path.splitext(filepath)
            counter = 1
            new_filepath = filepath
            while os.path.exists(new_filepath):
                new_filepath = f"{base}({counter}){ext}"
                counter += 1
            return new_filepath

        # Set an output file path for the .csv file. 
        self.outputfilepath = os.path.join(self.outputpath, f"{self.base_processedfilename}_analytics.csv")
        self.outputfilepath = get_unique_filepath(self.outputfilepath)

        if process_type == "encrypt":
            command = f"python -u analysis-cli.py -o {self.origfilepath} -e {self.processedfilepath} -p 12345 -m encryption -w {self.outputfilepath} -t {self.algorithm} --etime {self.timefilepath} --verbose"

        else:
            command = f"python -u analysis-cli.py -o {self.origfilepath} -d {self.processedfilepath} -p 12345 -m psnr -w {self.outputfilepath} -t {self.algorithm} --dtime {self.timefilepath} --verbose"
        #analysis-cli.py -o /path/to/orig_video.mp4 -d /path/to/decrypted_video.avi -p 12345 -m psnr -w /path/to/csv/save/path -t fisher-yates --dtime /path/to/decrypt_time.txt
        #python analysis-cli.py -o ../tests/test_orig.mp4 -e ./test_encrypt.avi -p 12345 -m encryption -w ./test_csv.csv -t fisher-yates --etime ./time_encrypt.txt --verbose#

        return command

    def _run_subprocess(self, command: str):
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
                yield f"data: {json.dumps({'stdout': stdout_line.strip(), 'status': 'processing'})}\n\n"
                stdout_lines.append(stdout_line.strip())

            # Stream stderr
            for stderr_line in iter(self.process.stderr.readline, ""):
                yield f"data: {json.dumps({'stderr': stderr_line.strip(), 'status': 'processing'})}\n\n"
                stderr_lines.append(stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            stdout_str = "\n".join(stdout_lines)
            stderr_str = "\n".join(stderr_lines)
            algorithm = self.algorithm
            inputfile = self.base_processedfilename + self.inputfile_ext
            outputfilepath = self.outputfilepath

            if self.process.returncode == 0:
                yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': stdout_str, 'stderr': stderr_str, 'algorithm': algorithm, 'inputfile': inputfile, 'outputfilepath': outputfilepath})}\n\n"
                
            else:
                if self.is_halted:
                    yield f"data: {json.dumps({'message': 'Process halted by user request.', 'status': 'failure', 'stdout': 'HALTED', 'stderr': stderr_str})}\n\n"

                else:
                    yield f"data: {json.dumps({'message': 'Process encountered an issue', 'status': 'failure', 'stdout': stdout_str, 'stderr': stderr_str, 'command': command})}\n\n"
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def process_request(self, process_type: str):
        """Handle the complete request for analysis of encryption or decryption."""
        command = self._generate_command(process_type)
        subprocess = self._run_subprocess(command)

        for out in subprocess:
            yield out
    
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