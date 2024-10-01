import os
import sys
import io
import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fisher_yates import Encrypt as Encrypt_FY
from _3d_cosine import Encrypt_cosine as Encrypt_3DCos
from contextlib import redirect_stdout

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaptureOutput:
    def __init__(self):
        self._output = io.StringIO()

    def __enter__(self):
        self._original_stdout = sys.stdout  # Save original stdout
        sys.stdout = self._output  # Redirect stdout to the StringIO object
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout  # Restore original stdout

    def get_output(self):
        # Get the captured output
        output = self._output.getvalue()
        
        # Check if there is only one line in the output
        if output.count('\n') <= 1: 
            return output.replace("\n", "")  
        return output  

class CommandHandler:
    def __init__(self, process_type: str, algorithm: str, filepath: str, password: str, outputpath: str, hashpath: str):
        # User Inputs
        self.process_type = process_type
        self.algorithm = algorithm
        self.filepath = filepath
        self.password = password
        self.outputpath = outputpath
        self.hashpath = hashpath
        
        # Necessary variables for output
        self.base_filename = os.path.splitext(os.path.basename(self.filepath))[0]
        self.inputfile_ext = os.path.splitext(os.path.basename(self.filepath))[1]
        self.output_filepath = self._generate_output_path()
        self.key_file = self._generate_key_file()
        
        # Initialize the appropriate encryption class
        if self.algorithm == "FY-Logistic":
            self.encryption_instance = Encrypt_FY()
        else:
            self.encryption_instance = Encrypt_3DCos()

        # Async task for process management
        self.process_task = None

        self.stdout = None

    def _generate_output_path(self):
        """Generate output path based on process type."""
        if self.process_type == "encrypt":
            if self.outputpath and self.outputpath.strip():
                path = os.path.join(self.outputpath, f"{self.base_filename}_encrypted.avi")
            else:
                path = self.filepath.replace(".mp4", "_encrypted.avi")
        else:
            if self.outputpath and self.outputpath.strip():
                path = os.path.join(self.outputpath, f"{self.base_filename}_decrypted.avi")
            else:
                path = self.filepath.replace(".avi", "_decrypted.avi")
        
        return path
    
    def _generate_key_file(self):
        """Generate the key file path for encryption or decryption."""
        if self.process_type == "encrypt":
            if self.hashpath and self.hashpath.strip():
                path = os.path.join(self.hashpath, f"{self.base_filename}.key")
            else:
                path = os.path.join(os.path.dirname(self.filepath), f"{self.base_filename}.key")
        else:
            if self.hashpath and self.hashpath.strip():
                path = self.hashpath
            else:
                raise HTTPException(status_code=400, detail="Key file path is required for decryption")
        
        return path

    async def _run_process(self):
        """Run the encryption or decryption process asynchronously."""
        output_capturer = CaptureOutput()  # Create an output capturer
        with output_capturer:  # Use the context manager to capture stdout
            try:
                if self.process_type == "encrypt":
                    await asyncio.to_thread(
                        self.encryption_instance.encryptVideo,
                        self.filepath,
                        self.output_filepath,
                        self.key_file,
                        self.password,
                        True  
                    )
                else:  # Decrypt
                    await asyncio.to_thread(
                        self.encryption_instance.decryptVideo,
                        self.filepath,
                        self.output_filepath,
                        self.key_file,
                        self.password,
                        True  
                    )
            except Exception as e:
                # If an error occurs, capture the output and re-raise the exception
                captured_output = output_capturer.get_output()
                raise HTTPException(status_code=500, detail=str(e), headers={"Output": captured_output})

        captured_output = output_capturer.get_output() 
        return captured_output
    
    async def process_request(self):
        """Handle the encryption or decryption process asynchronously."""
        try:
            self.process_task = asyncio.create_task(self._run_process())
            self.stdout = await self.process_task  # Wait for the process to complete

            return {
                "message": "Process completed",
                "status": "success",
                "inputfile": self.base_filename + self.inputfile_ext,
                "outputloc": self.output_filepath,
                "stdout": self.stdout  # Include captured output in the response
            }
            
        except asyncio.CancelledError:
            return {
                "message": "Process was cancelled",
                "status": "failure",
            }
            
        except HTTPException as e:
            # Return the captured output even if there's an exception
            return {
                "message": "Process failed",
                "status": "failure",
                "detail": str(e.detail),
                "stdout": e.headers.get("Output", "")  # Include captured output in the response
            }

        except Exception as e:
            print(self.stdout)
            raise HTTPException(status_code=500, detail=str(e))

    async def halt_process(self):
        """Implement halting logic for asynchronous process."""
        if self.process_task and not self.process_task.done():
            self.process_task.cancel()  # Cancel the async task
            self.encryption_instance.cancel()
            try:
                await self.process_task  # Wait for cancellation
            except asyncio.CancelledError:
                return {
                    "message": "Process was halted",
                    "status": "failure",
                    "stdout": "HALTED"
                }
        
        return {"message": "No process to halt"}

# Global variable to store the current CommandHandler instance
current_handler = None

@app.post("/encrypt/processing")
async def encrypt_video(request: Request):
    global current_handler
    body = await request.json()
    
    # Extract values from the body
    algorithm = body.get("algorithm")
    filepath = body.get("filepath")
    password = body.get("password")
    outputpath = body.get("outputpath")
    hashpath = body.get("hashpath")
    
    # Initialize the CommandHandler
    current_handler = CommandHandler(process_type="encrypt", algorithm=algorithm, filepath=filepath, password=password, outputpath=outputpath, hashpath=hashpath)
    
    # Run the process asynchronously
    return await current_handler.process_request()

@app.post("/decrypt/processing")
async def decrypt_video(request: Request):
    global current_handler
    body = await request.json()

    # Extract values from the body
    algorithm = body.get("algorithm")
    filepath = body.get("filepath")
    password = body.get("password")
    outputpath = body.get("outputpath")
    hashpath = body.get("hashpath")
    
    # Initialize the CommandHandler
    current_handler = CommandHandler(process_type="decrypt", algorithm=algorithm, filepath=filepath, password=password, outputpath=outputpath, hashpath=hashpath)
    
    # Run the process asynchronously
    return await current_handler.process_request()

@app.post("/halt_processing")
async def halt_processing():
    global current_handler
    if current_handler:
        print(current_handler.process_type)
        return await current_handler.halt_process()
    return {"message": "No active process to halt"}