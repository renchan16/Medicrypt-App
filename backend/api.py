from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

        return {"message": "Encryption process started", "status": "success"}
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