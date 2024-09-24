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
    filepath: str
    hashpath: str
    password: str

@app.post("/encrypt")
async def encrypt_video(request: CryptoRequest):
    try:
        print("Received encryption request:")
        print(f"Algorithm: {request.algorithm}")
        print(f"File Path: {request.filepath}")
        print(f"Hash Path: {request.hashpath}")
        print(f"Password: {'*' * len(request.password)}")

        base_filename = os.path.splitext(os.path.basename(request.filepath))[0]

        key_file = os.path.join(request.hashpath, f"{base_filename}.key")

        # Get value and set to algorithm variable the counterpart to the CLI (TO BE CHANGED)
        if (request.algorithm == "FY-Logistic"):
            algorithm = "fisher-yates"
        
        else:
            algorithm = "3D-Cosine"

        command = [
            "python", "medicrypt-cli.py", "encrypt",
            "-i", request.filepath,
            "-o", request.filepath.replace(".mp4", "_encrypted.avi"),  # Save output with different name
            "-t", algorithm,
            "-k", key_file,
            "-p", request.password
        ]
        
        # Start the subprocess
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

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

        # Wait for the process to complete
        process.wait()

        # Check the result code
        if process.returncode == 0:
            return {"message": "Encryption process completed", "status": "success", "output": "\n".join(output_lines)}
        else:
            raise Exception("\n".join(output_lines))
        
    except Exception as e:
        print(f"Encryption error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/decrypt")
async def decrypt_video(request: CryptoRequest):
    try:
        print("Received decryption request:")
        print(f"Algorithm: {request.algorithm}")
        print(f"File Path: {request.filepath}")
        print(f"Hash Path: {request.hashpath}")
        print(f"Password: {'*' * len(request.password)}")

        return {"message": "Decryption process started", "status": "success"}
    except Exception as e:
        print(f"Decryption error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))