import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
from fisher_yates import Encrypt

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
    filepath: str
    hashpath: str
    password: str

class CommandGenerator:
    def __init__(self, algorithm: str, filepath: str, hashpath: str, password: str):
        self.algorithm = algorithm
        self.filepath = filepath
        self.hashpath = hashpath
        self.password = password

    def _get_algorithm(self):
        """Internal method to map algorithm name to its corresponding CLI argument."""
        if self.algorithm == "FY-Logistic":
            return "fisher-yates"
        
        else:
            return "3D-cosine"

    def generate_encryption_command(self) -> str:
        """Generate the encryption command."""
        algorithm = self._get_algorithm()
        base_filename = os.path.splitext(os.path.basename(self.filepath))[0]
        key_file = os.path.join(self.hashpath, f"{base_filename}.key")
        output_filepath = self.filepath.replace(".mp4", "_encrypted.avi")
        
        command = f"python medicrypt-cli.py encrypt -i {self.filepath} -o {output_filepath} -t {algorithm} -k {key_file} -p {self.password}"
        
        return command

    def generate_decryption_command(self) -> str:
        """Generate the decryption command."""
        algorithm = self._get_algorithm()
        output_filepath = self.filepath.replace(".avi", "_decrypted.avi")

        command = f"python medicrypt-cli.py decrypt -i {self.filepath} -o {output_filepath} -t {algorithm} -k {self.hashpath} -p {self.password}"
        return command

@app.post("/encrypt/processing")
async def encrypt_video(request: CryptoRequest):
    try:
        commandGenerator = CommandGenerator(algorithm=request.algorithm, filepath=request.filepath, hashpath=request.hashpath, password=request.password)
        command = commandGenerator.generate_encryption_command()

        print(command)

        """
        # Start the subprocess
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')

        # Stream and log both stdout and stderr in real-time
        output_lines = []
        for stdout_line in iter(process.stdout.readline, ""):
            print(f"Output: {stdout_line.strip()}")
            output_lines.append(stdout_line.strip())  # Collect the output
        for stderr_line in iter(process.stderr.readline, ""):
            print(f"Error: {stderr_line.strip()}")
            output_lines.append(f"Error: {stderr_line.strip()}")  # Collect the errors

        process.stdout.close()
        process.stderr.close()

        process.wait()

        if process.returncode == 0:
            return {"message": "Encryption process completed", "status": "success", "output": "\n".join(output_lines)}
        else:
            raise Exception("\n".join(output_lines))
        """
        
    except Exception as e:
        print(f"Encryption error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decrypt/processing")
async def decrypt_video(request: CryptoRequest):
    try:
        commandGenerator = CommandGenerator(algorithm=request.algorithm, filepath=request.filepath, hashpath=request.hashpath, password=request.password)
        command = commandGenerator.generate_decryption_command()

        
        # Start the subprocess
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,  encoding='utf-8')

        # Stream and log both stdout and stderr in real-time
        output_lines = []
        for stdout_line in iter(process.stdout.readline, ""):
            print(f"Output: {stdout_line.strip()}")
            output_lines.append(stdout_line.strip())  # Collect the output
        for stderr_line in iter(process.stderr.readline, ""):
            print(f"Error: {stderr_line.strip()}")
            output_lines.append(f"Error: {stderr_line.strip()}")  # Collect the errors

        process.stdout.close()
        process.stderr.close()

        process.wait()

        if process.returncode == 0:
            return {"message": "Decryption process completed", "status": "success", "output": "\n".join(output_lines)}
        else:
            raise Exception("\n".join(output_lines))
        
    except Exception as e:
        print(f"Decryption error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))