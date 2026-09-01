from __future__ import annotations

from dataclasses import dataclass
from typing import List

import numpy as np
from PIL import Image


@dataclass
class OCRItem:
    text: str
    confidence: float


class OCREngine:
    """Lazy local OCR wrapper. No cloud API is used."""

    def __init__(self) -> None:
        self._engine = None

    def _get_engine(self):
        if self._engine is None:
            from paddleocr import PaddleOCR

            self._engine = PaddleOCR(
                use_angle_cls=True,
                lang="ch",
                show_log=False,
            )
        return self._engine

    def read(self, image: Image.Image) -> List[OCRItem]:
        engine = self._get_engine()
        result = engine.ocr(np.array(image.convert("RGB")), cls=True)
        items: List[OCRItem] = []

        for page in result or []:
            for row in page or []:
                if not row or len(row) < 2:
                    continue
                payload = row[1]
                if not payload or len(payload) < 2:
                    continue
                text = str(payload[0]).strip()
                confidence = float(payload[1])
                if text:
                    items.append(OCRItem(text=text, confidence=confidence))

        return items


ocr_engine = OCREngine()
