from __future__ import annotations

import io
import re
from collections import Counter
from typing import Dict, List

from PIL import Image

from .clip_engine import clip_engine
from .layout import split_recommendation_regions
from .ocr_engine import ocr_engine


SUPPORTED_PLATFORMS = {"meituan", "douyin", "xiaohongshu", "taobao"}
DISCOUNT_KEYWORDS = ["神券", "优惠", "满减", "立减", "红包", "补贴", "券后", "折扣", "大促", "省"]
PLANNING_KEYWORDS = ["攻略", "教程", "测评", "对比", "清单", "避雷", "参数", "指南"]

PRICE_PATTERNS = [
    re.compile(r"[¥￥]\s*(\d{1,4}(?:\.\d{1,2})?)"),
    re.compile(r"(?:人均|起送|券后|到手|实付|价格)\s*[¥￥]?\s*(\d{1,4}(?:\.\d{1,2})?)"),
]


def _extract_prices(texts: List[str]) -> List[float]:
    values: List[float] = []
    for text in texts:
        for pattern in PRICE_PATTERNS:
            for value in pattern.findall(text):
                try:
                    number = float(value)
                except ValueError:
                    continue
                if 1 <= number <= 5000:
                    values.append(number)
    return values[:30]


def _keyword_hits(texts: List[str], keywords: List[str]) -> List[str]:
    hits = []
    joined = "\n".join(texts)
    for keyword in keywords:
        if keyword in joined:
            hits.append(keyword)
    return hits


def analyze_image(image_bytes: bytes, platform_id: str) -> Dict:
    if platform_id not in SUPPORTED_PLATFORMS:
        raise ValueError("unsupported platform")

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    ocr_items = ocr_engine.read(image)
    ocr_texts = [item.text for item in ocr_items if item.confidence >= 0.45]

    regions = split_recommendation_regions(image, platform_id)
    category_counter: Counter[str] = Counter()
    category_score_sum: Counter[str] = Counter()
    region_results = []

    for index, region in enumerate(regions):
        predictions = clip_engine.classify(region, top_k=2)
        if not predictions:
            continue
        top = predictions[0]
        category_counter[top.label] += 1
        category_score_sum[top.label] += top.score
        region_results.append({
            "index": index,
            "category": top.label,
            "confidence": top.score,
            "alternatives": [
                {"label": item.label, "score": item.score}
                for item in predictions[1:]
            ],
        })

    categories = []
    total = sum(category_counter.values()) or 1
    for label, count in category_counter.most_common(6):
        categories.append({
            "label": label,
            "count": count,
            "ratio": round(count / total, 3),
            "confidence": round(category_score_sum[label] / count, 4),
        })

    discount_hits = _keyword_hits(ocr_texts, DISCOUNT_KEYWORDS)
    planning_hits = _keyword_hits(ocr_texts, PLANNING_KEYWORDS)
    price_values = _extract_prices(ocr_texts)

    return {
        "platformId": platform_id,
        "categories": categories,
        "regions": region_results,
        "priceValues": price_values,
        "discountHits": discount_hits,
        "planningHits": planning_hits,
        "ocrTexts": ocr_texts[:60],
        "meta": {
            "width": image.width,
            "height": image.height,
            "regionCount": len(regions),
            "ocrCount": len(ocr_texts),
        },
    }
