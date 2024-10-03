from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from concurrent.futures import ThreadPoolExecutor
from command_handler import EncryptionCommandHandler, AnalysisCommandHandler

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

# Global variable to store the current EncryptionCommandHandler instance
current_handler = None

@app.post("/init_cryptographic_handler")
async def init_cryptographic_handler(request: Request):
    global current_handler
    body = await request.json()

    # Extract values from the body
    algorithm = body.get("algorithm")
    filepath = body.get("filepath")
    password = body.get("password")
    outputpath = body.get("outputpath")
    hashpath = body.get("hashpath")
    
    # Initialize the EncryptionCommandHandler
    current_handler = EncryptionCommandHandler(
        algorithm=algorithm,
        filepath=filepath,
        password=password,
        outputpath=outputpath,
        hashpath=hashpath
    )
    
    return {"message": "Handler initialized successfully"}

@app.post("/init_analysis_handler")
async def init_analysis_handler(request: Request):
    global current_handler
    body = await request.json()

    # Extract values from the body
    algorithm = body.get("algorithm")
    origfilepath = body.get("origfilepath")
    processedfilepath = body.get("processedfilepath")
    timefilepath = body.get('timefilepath')
    outputpath = body.get('outputpath')

    # Initialize the AnalysisCommandHandler
    current_handler = AnalysisCommandHandler(
        algorithm=algorithm,
        origfilepath=origfilepath,
        processedfilepath= processedfilepath,
        timefilepath=timefilepath,
        outputpath=outputpath
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

@app.get("/encrypt/evaluating")
async def encrypt_evaluate(request: Request):
    global current_handler
    if not current_handler:
        raise HTTPException(status_code=400, detail="Handler not initialized.")

    # Use the executor to run the process in a separate thread
    return StreamingResponse(current_handler.process_request("encrypt"), media_type="text/event-stream")

@app.get("/decrypt/evaluating")
async def encrypt_evaluate(request: Request):
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

