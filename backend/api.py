"""
This FastAPI application provides endpoints to initialize cryptographic and analysis handlers, process encryption and decryption requests, 
and handle evaluation of cryptographic processes. It uses `EncryptionProcessHandler` and `AnalysisProcessHandler` to manage the core logic 
for handling cryptographic operations.

Functions:
----------
1. init_cryptographic_handler (POST /init_cryptographic_handler):
   - Initializes the `EncryptionProcessHandler` with parameters such as algorithm, file paths, password, output directory, and hash path.
   
2. init_analysis_handler (POST /init_analysis_handler):
   - Initializes the `AnalysisProcessHandler` with parameters like the algorithm, original and processed file paths, time file paths, and output directory.

3. encrypt_video (GET /encrypt/processing):
   - Starts the encryption process using the initialized `EncryptionProcessHandler` and streams the encryption process.

4. decrypt_video (GET /decrypt/processing):
   - Starts the decryption process using the initialized `EncryptionProcessHandler` and streams the decryption process.

5. encrypt_evaluate (GET /encrypt/evaluating):
   - Starts the encryption evaluation process and streams the evaluation output.

6. decrypt_evaluate (GET /decrypt/evaluating):
   - Starts the decryption evaluation process and streams the evaluation output.

7. halt_processing (POST /halt_processing):
   - Halts any ongoing encryption or decryption process by invoking the `halt_process` method on the current handler.

Variables:
----------
- current_handler:
  Global variable used to store an instance of either `EncryptionProcessHandler` or `AnalysisProcessHandler`. This variable is updated 
  each time a handler is initialized and is used in encryption, decryption, or evaluation processes.

Dependencies:
-------------
- FastAPI
- CORSMiddleware for handling cross-origin requests
- StreamingResponse for streaming the output of processes
- Custom handlers: `EncryptionProcessHandler`, `AnalysisProcessHandler`

Code Author: [Author Name]
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from process_handler import EncryptionProcessHandler, AnalysisProcessHandler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the current EncryptionProcessHandler instance
current_handler = None

@app.post("/init_cryptographic_handler")
async def init_cryptographic_handler(request: Request):
    global current_handler
    _body = await request.json()

    # Extract values from the _body
    _algorithm = _body.get("algorithm")
    _input_filepaths = _body.get("filepaths")
    _password = _body.get("password")
    _output_dirpath = _body.get("outputDirpath")
    _hash_path = _body.get("hashPath")
    
    # Initialize the EncryptionProcessHandler
    current_handler = EncryptionProcessHandler(
        algorithm=_algorithm,
        input_filepaths=_input_filepaths,
        password=_password,
        output_dirpath=_output_dirpath,
        hash_path=_hash_path
    )
    
    return {"message": "Handler initialized successfully"}

@app.post("/init_analysis_handler")
async def init_analysis_handler(request: Request):
    global current_handler
    _body = await request.json()

    # Extract values from the _body
    algorithm = _body.get("algorithm")
    orig_filepaths = _body.get("origFilepaths")
    processed_filepaths = _body.get("processedFilepaths")
    time_filepaths = _body.get('timeFilepaths')
    output_dirpath = _body.get('outputDirpath')

    # Initialize the AnalysisProcessHandler
    current_handler = AnalysisProcessHandler(
        algorithm=algorithm,
        orig_filepaths=orig_filepaths,
        processed_filepaths=processed_filepaths,
        time_filepaths=time_filepaths,
        output_dirpath=output_dirpath
    )

    return {"message": "Handler initialized successfully"}

@app.get("/encrypt/processing")
async def encrypt_video(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")

    return StreamingResponse(current_handler.process_request("encrypt"), media_type="text/event-stream")

@app.get("/decrypt/processing")
async def decrypt_video(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")

    return StreamingResponse(current_handler.process_request("decrypt"), media_type="text/event-stream")

@app.get("/encrypt/evaluating")
async def encrypt_evaluate(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")

    return StreamingResponse(current_handler.process_request("encrypt"), media_type="text/event-stream")

@app.get("/decrypt/evaluating")
async def encrypt_evaluate(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")

    return StreamingResponse(current_handler.process_request("decrypt"), media_type="text/event-stream")

@app.post("/halt_processing")
async def halt_processing():
    global current_handler
    if current_handler:
        return current_handler.halt_process()
    return {"message": "No active process to halt"}