import json
from pathlib import Path
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import Response

class Photo(BaseModel):
    id: str
    src: str
    title: str
    subtitle: str
    alt: str
    category: Literal["couple", "family"]
    position: str = "center"


class Letter(BaseModel):
    title: str
    paragraphs: list[str]
    signature: str


class Celebration(BaseModel):
    years: int
    dedication: str
    letter: Letter
    photos: list[Photo]
    wishes: list[str]


app = FastAPI(title="20 років разом", version="1.0.0")
content = Celebration.model_validate(
    json.loads(Path(__file__).with_name("content.json").read_text(encoding="utf-8"))
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.head("/api/health")
def health_head():
    return Response(status_code=200)


@app.get("/api/celebration", response_model=Celebration)
def celebration() -> Celebration:
    return content
