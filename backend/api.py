import os
import signal
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommandHandler:
    def __init__(self, algorithm: str, filepath: str, password: str, outputpath: str, hashpath: str):
        # User Inputs
        self.algorithm = algorithm
        self.filepath = filepath
        self.password = password
        self.outputpath = outputpath
        self.hashpath = hashpath
        
        # Necessary variables for output
        self.base_filename = os.path.splitext(os.path.basename(self.filepath))[0]
        self.inputfile_ext = os.path.splitext(os.path.basename(self.filepath))[1]
        self.output_filepath = None
        
        # Subprocess
        self.process = None

    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        return "fisher-yates" if self.algorithm == "FY-Logistic" else "3d-cosine"

    def _generate_command(self, process_type: str) -> str:
        """Generate the appropriate encryption or decryption command."""
        algorithm = self._get_algorithm()
        
        # Handle hashpath only for encryption, and fall back to filepath's directory
        if self.hashpath and self.hashpath.strip():
            key_file = os.path.join(self.hashpath, f"{self.base_filename}.key")
        else:
            # Use the directory of the file and append the base filename with .key
            key_file = os.path.join(os.path.dirname(self.filepath), f"{self.base_filename}.key")

        if process_type == "encrypt":
            if self.outputpath and self.outputpath.strip():
                self.output_filepath = os.path.join(self.outputpath, f"{self.base_filename}_encrypted.avi")
            else:
                self.output_filepath = self.filepath.replace(".mp4", "_encrypted.avi")

            command = f"python medicrypt-cli.py encrypt -i {self.filepath} -o {self.output_filepath} -t {algorithm} -k {key_file} -p {self.password} --verbose"
        
        else:  # Decrypt
            if self.outputpath and self.outputpath.strip():
                self.output_filepath = os.path.join(self.outputpath, f"{self.base_filename}_decrypted.avi")
            else:
                self.output_filepath = self.filepath.replace(".avi", "_decrypted.avi")

            command = f"python medicrypt-cli.py decrypt -i {self.filepath} -o {self.output_filepath} -t {algorithm} -k {self.hashpath} -p {self.password} --verbose"
        
        return command

    def _run_subprocess(self, command: str) -> dict:
        """Run the subprocess and handle real-time stdout and stderr logging."""
        try:
            self.process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, preexec_fn=os.setsid)
            
            stdout_lines = []
            stderr_lines = []

            # Stream stdout
            for stdout_line in iter(self.process.stdout.readline, ""):
                print(f"Output: {stdout_line.strip()}")
                stdout_lines.append(stdout_line.strip())

            # Stream stderr
            for stderr_line in iter(self.process.stderr.readline, ""):
                print(f"Error: {stderr_line.strip()}")
                stderr_lines.append(stderr_line.strip())

            self.process.stdout.close()
            self.process.stderr.close()
            self.process.wait()

            if self.process.returncode == 0:
                return {
                    "message": "Process completed",
                    "status": "success",
                    "stdout": "\n".join(stdout_lines),
                    "stderr": "\n".join(stderr_lines),
                    "inputfile": self.base_filename + self.inputfile_ext,
                    "outputloc" : self.output_filepath
                }
            else:
                return {
                    "message": "Process encountered an issue",
                    "status": "failure",
                    "stdout": "\n".join(stdout_lines),
                    "stderr": "\n".join(stderr_lines),
                    "inputfile": self.base_filename + self.inputfile_ext
                }
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def process_request(self, process_type: str) -> dict:
        """Handle the complete request for encryption or decryption."""
        command = self._generate_command(process_type)
        return self._run_subprocess(command)

    def halt_process(self):
        if self.process and self.process.poll() is None:
            # Use different signals to terminate the process depending on the platform
            os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
            return {"message": "Process halted successfully"}
        return {"message": "No active process to halt"}

# Global variable to store the current CommandHandler instance
current_handler = None

@app.post("/encrypt/processing")
async def encrypt_video(request: Request):
    global current_handler
    body = await request.json()
    
    # Extract values from the body (manually handle any validation needed here)
    algorithm = body.get("algorithm")
    filepath = body.get("filepath")
    password = body.get("password")
    outputpath = body.get("outputpath")
    hashpath = body.get("hashpath")
    
    # Initialize and process the encryption
    current_handler = CommandHandler(algorithm=algorithm, filepath=filepath, password=password, outputpath=outputpath, hashpath=hashpath)
    return current_handler.process_request(process_type="encrypt")

@app.post("/decrypt/processing")
async def decrypt_video(request: Request):
    global current_handler
    body = await request.json()

    # Extract values from the body (manually handle any validation needed here)
    algorithm = body.get("algorithm")
    filepath = body.get("filepath")
    password = body.get("password")
    outputpath = body.get("outputpath")
    hashpath = body.get("hashpath")
    
    # Initialize and process the decryption
    current_handler = CommandHandler(algorithm=algorithm, filepath=filepath, password=password, outputpath=outputpath, hashpath=hashpath)
    return current_handler.process_request(process_type="decrypt")

@app.post("/halt_processing")
async def halt_processing():
    global current_handler
    if current_handler:
        return current_handler.halt_process()
    return {"message": "No active process to halt"}