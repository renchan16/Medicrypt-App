import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CryptoRequest(BaseModel): 
    algorithm: str
    password: str
    outputpath: str
    filepath: str
    hashpath: str

class CommandHandler:
    def __init__(self, algorithm: str, filepath: str, password: str, outputpath: str, hashpath: str):
        self.algorithm = algorithm
        self.filepath = filepath
        self.password = password
        self.outputpath = outputpath
        self.hashpath = hashpath
        

    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        return "fisher-yates" if self.algorithm == "FY-Logistic" else "3d-cosine"

    def _generate_command(self, process_type: str) -> str:
        """Generate the appropriate encryption or decryption command."""
        algorithm = self._get_algorithm()
        base_filename = os.path.splitext(os.path.basename(self.filepath))[0]
        
        # Handle hashpath only for encryption, and fall back to filepath's directory
        if self.hashpath and self.hashpath.strip():
            key_file = f"{self.hashpath}\\{base_filename}.key"
            
        else:
            # Use the directory of the file and append the base filename with .key
            key_file = f"{os.path.dirname(self.filepath)}\\{base_filename}.key"

        if process_type == "encrypt":
            if self.outputpath and self.outputpath.strip():
                output_filepath = f"{self.outputpath}\\{base_filename}_encrypted.avi"
                
            else:
                output_filepath = self.filepath.replace(".mp4", "_encrypted.avi")

            command = f"python medicrypt-cli.py encrypt -i {self.filepath} -o {output_filepath} -t {algorithm} -k {key_file} -p {self.password}"
        
        else:  # Decrypt
            if self.outputpath and self.outputpath.strip():
                output_filepath = f"{self.outputpath}\\{base_filename}_decrypted.avi"
                
            else:
                output_filepath = self.filepath.replace(".avi", "_decrypted.avi")

            command = f"python medicrypt-cli.py decrypt -i {self.filepath} -o {output_filepath} -t {algorithm} -k {self.hashpath} -p {self.password}"
        
        return command

    def _run_subprocess(self, command: str) -> dict:
        """Run the subprocess and handle real-time stdout and stderr logging."""
        try:
            process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            output_lines = []

            # Stream stdout
            for stdout_line in iter(process.stdout.readline, ""):
                print(f"Output: {stdout_line.strip()}")
                output_lines.append(stdout_line.strip())

            # Stream stderr
            for stderr_line in iter(process.stderr.readline, ""):
                print(f"Error: {stderr_line.strip()}")
                output_lines.append(f"Error: {stderr_line.strip()}")

            process.stdout.close()
            process.stderr.close()
            process.wait()

            if process.returncode == 0:
                return {"message": "Process completed", "status": "success", "output": "\n".join(output_lines)}
            
            else:
                raise Exception("\n".join(output_lines))
            
        except Exception as e:
            print(f"Subprocess error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def process_request(self, process_type: str) -> dict:
        """Handle the complete request for encryption or decryption."""
        command = self._generate_command(process_type)
        return self._run_subprocess(command)

@app.post("/encrypt/processing")
async def encrypt_video(request: CryptoRequest):
    handler = CommandHandler(algorithm=request.algorithm, filepath=request.filepath, password=request.password, outputpath=request.outputpath, hashpath=request.hashpath)
    return handler.process_request(process_type="encrypt")

@app.post("/decrypt/processing")
async def decrypt_video(request: CryptoRequest):
    handler = CommandHandler(algorithm=request.algorithm, filepath=request.filepath, password=request.password, outputpath=request.outputpath, hashpath=request.hashpath)
    return handler.process_request(process_type="decrypt")