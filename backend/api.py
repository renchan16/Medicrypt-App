from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from command_handler import EncryptionCommandHandler, AnalysisCommandHandler

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store the current EncryptionCommandHandler instance
current_handler = None

@app.post("/init_cryptographic_handler")
async def init_cryptographic_handler(request: Request):
    global current_handler
    _body = await request.json()

    # Extract values from the _body
    _algorithm = _body.get("algorithm")
    _input_filepaths = _body.get("filepath")
    _password = _body.get("password")
    _output_dirpath = _body.get("outputpath")
    _hash_path = _body.get("hashpath")
    
    # Initialize the EncryptionCommandHandler
    current_handler = EncryptionCommandHandler(
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
    orig_filepaths = _body.get("origfilepath")
    processed_filepaths = _body.get("processedfilepath")
    time_filepaths = _body.get('timefilepath')
    output_dirpath = _body.get('outputpath')

    # Initialize the AnalysisCommandHandler
    current_handler = AnalysisCommandHandler(
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