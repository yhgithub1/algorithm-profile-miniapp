from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .services.analyzer import SUPPORTED_PLATFORMS, analyze_image


app = FastAPI(
    title="Algorithm Profile Screenshot Analyzer",
    version="0.1.0",
    description="Local OCR + OpenCLIP screenshot analyzer. No commercial multimodal API is used.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "ok": True,
        "mode": "local-ocr-clip",
        "platforms": sorted(SUPPORTED_PLATFORMS),
    }


@app.post("/analyze")
async def analyze(
    platform: str = Form(...),
    file: UploadFile = File(...),
):
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail="Unsupported platform")

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty image")
    if len(content) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be smaller than 12 MB")

    try:
        result = analyze_image(content, platform)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    return {"ok": True, "analysis": result}
