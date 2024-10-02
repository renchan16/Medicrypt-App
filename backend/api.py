import os
import signal
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import subprocess
from concurrent.futures import ThreadPoolExecutor
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ThreadPoolExecutor
executor = ThreadPoolExecutor(max_workers=3)

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

        # Flags
        self.is_halted = False

    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        return "fisher-yates" if self.algorithm == "FY-Logistic" else "3d-cosine"

    def _generate_command(self, process_type: str) -> str:
        """Generate the appropriate encryption or decryption command."""
        algorithm = self._get_algorithm()
        
        # Helper function to check if the file exists and append a number if necessary
        def get_unique_filepath(filepath):
            base, ext = os.path.splitext(filepath)
            counter = 1
            new_filepath = filepath
            while os.path.exists(new_filepath):
                new_filepath = f"{base}({counter}){ext}"
                counter += 1
            return new_filepath

        # Handle hashpath only for encryption, and fall back to filepath's directory
        if self.hashpath and self.hashpath.strip():
            key_file = os.path.join(self.hashpath, f"{self.base_filename}.key")

        else:
            # Use the directory of the file and append the base filename with .key
            key_file = os.path.join(os.path.dirname(self.filepath), f"{self.base_filename}.key")

        if process_type == "encrypt":
            # Determine output path for encrypted file
            if self.outputpath and self.outputpath.strip():
                self.output_filepath = os.path.join(self.outputpath, f"{self.base_filename}_encrypted.avi")

            else:
                self.output_filepath = self.filepath.replace(".mp4", "_encrypted.avi")

            # Ensure the output filepath is unique
            self.output_filepath = get_unique_filepath(self.output_filepath)

            command = f"python -u medicrypt-cli.py encrypt -i {self.filepath} -o {self.output_filepath} -t {algorithm} -k {key_file} -p {self.password} --verbose"
        
        else:  # Decrypt
            # Determine output path for decrypted file
            if self.outputpath and self.outputpath.strip():
                self.output_filepath = os.path.join(self.outputpath, f"{self.base_filename}_decrypted.avi")
                
            else:
                self.output_filepath = self.filepath.replace(".avi", "_decrypted.avi")

            # Ensure the output filepath is unique
            self.output_filepath = get_unique_filepath(self.output_filepath)

            command = f"python -u medicrypt-cli.py decrypt -i {self.filepath} -o {self.output_filepath} -t {algorithm} -k {self.hashpath} -p {self.password} --verbose"
        
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
            outputloc = self.output_filepath

            if self.process.returncode == 0:
                yield f"data: {json.dumps({'message': 'Process completed', 'status': 'success', 'stdout': stdout_str, 'stderr': stderr_str, 'inputfile': inputfile, 'outputloc': outputloc})}\n\n"
                
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
        if self.process and self.process.poll() is None:
            # Use different signals to terminate the process depending on the platform
            if sys.platform.startswith('win'):
                self.process.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                
            self.is_halted = True
            return { "message": "Process halted successfully" }
        return {"message": "No active process to halt"}

    def test_func():
        yield "data: TEST\n\n"

# Global variable to store the current CommandHandler instance
current_handler = None

@app.post("/init_handler")
async def init_handler(request: Request):
    global current_handler
    body = await request.json()

    # Extract values from the body
    algorithm = body.get("algorithm")
    filepath = body.get("filepath")
    password = body.get("password")
    outputpath = body.get("outputpath")
    hashpath = body.get("hashpath")
    
    # Initialize the CommandHandler
    current_handler = CommandHandler(
        algorithm=algorithm,
        filepath=filepath,
        password=password,
        outputpath=outputpath,
        hashpath=hashpath
    )
    
    return {"message": "Handler initialized successfully"}

@app.get("/encrypt/processing")
async def encrypt_video(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")

    # Use the executor to run the process in a separate thread
    return StreamingResponse(current_handler.process_request("encrypt"), media_type="text/event-stream")

@app.get("/decrypt/processing")
async def decrypt_video(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")
    
    # Use the executor to run the process in a separate thread
    return StreamingResponse(current_handler.process_request("decrypt"), media_type="text/event-stream")

@app.post("/halt_processing")
async def halt_processing():
    global current_handler
    if current_handler:
        return current_handler.halt_process()
    return {"message": "No active process to halt"}