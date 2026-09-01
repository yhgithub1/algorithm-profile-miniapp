from __future__ import annotations

from typing import List

from PIL import Image


def _grid(image: Image.Image, top_ratio: float, columns: int, rows: int) -> List[Image.Image]:
    width, height = image.size
    top = int(height * top_ratio)
    content_height = max(1, height - top)
    cell_width = max(1, width // columns)
    cell_height = max(1, content_height // rows)
    crops: List[Image.Image] = []

    for row in range(rows):
        for col in range(columns):
            left = col * cell_width
            upper = top + row * cell_height
            right = width if col == columns - 1 else (col + 1) * cell_width
            lower = height if row == rows - 1 else top + (row + 1) * cell_height
            crop = image.crop((left, upper, right, lower))
            if crop.width >= 80 and crop.height >= 80:
                crops.append(crop)
    return crops


def split_recommendation_regions(image: Image.Image, platform_id: str) -> List[Image.Image]:
    """Cheap deterministic segmentation for an MVP.

    It avoids a large GUI parser dependency. The rules are intentionally simple and
    can later be replaced by OmniParser/YOLO without changing the API schema.
    """

    if platform_id == "douyin":
        return [image]
    if platform_id in {"xiaohongshu", "taobao"}:
        return _grid(image, top_ratio=0.16, columns=2, rows=3)
    if platform_id == "meituan":
        return _grid(image, top_ratio=0.20, columns=1, rows=4)
    return [image]
