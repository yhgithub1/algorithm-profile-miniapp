from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

import torch
from PIL import Image


CATEGORY_PROMPTS: Dict[str, str] = {
    "food": "food, meal, restaurant dish",
    "drink": "coffee, tea, milk tea, beverage",
    "travel": "travel destination, city trip, landscape",
    "hotel": "hotel room, resort, accommodation",
    "fashion": "fashion clothing outfit shoes bags",
    "beauty": "beauty cosmetics makeup skincare",
    "home": "home interior furniture household goods",
    "digital": "smartphone computer electronics digital products",
    "car": "car automobile vehicle",
    "fitness": "fitness gym sports exercise",
    "pets": "cat dog pet animal",
    "parenting": "baby child parenting family",
    "work": "office work business career",
    "knowledge": "education science knowledge tutorial",
    "entertainment": "movie television celebrity entertainment",
    "gaming": "video game gaming esports",
    "outdoor": "camping hiking outdoor activity",
    "snacks": "snacks desserts packaged food",
}

CATEGORY_LABELS = {
    "food": "美食",
    "drink": "咖啡奶茶",
    "travel": "旅行",
    "hotel": "酒店住宿",
    "fashion": "穿搭服饰",
    "beauty": "美妆护肤",
    "home": "家居生活",
    "digital": "数码科技",
    "car": "汽车",
    "fitness": "运动健身",
    "pets": "宠物",
    "parenting": "育儿亲子",
    "work": "职场商业",
    "knowledge": "知识教程",
    "entertainment": "影视娱乐",
    "gaming": "游戏电竞",
    "outdoor": "户外露营",
    "snacks": "零食甜品",
}


@dataclass
class CategoryPrediction:
    id: str
    label: str
    score: float


class CLIPEngine:
    """Local zero-shot image classifier based on OpenCLIP."""

    def __init__(self) -> None:
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.text_features = None
        self.ids = list(CATEGORY_PROMPTS.keys())
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def _load(self) -> None:
        if self.model is not None:
            return

        import open_clip

        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32",
            pretrained="laion2b_s34b_b79k",
            device=self.device,
        )
        self.tokenizer = open_clip.get_tokenizer("ViT-B-32")
        prompts = [CATEGORY_PROMPTS[item] for item in self.ids]
        tokens = self.tokenizer(prompts).to(self.device)

        with torch.no_grad():
            text_features = self.model.encode_text(tokens)
            self.text_features = text_features / text_features.norm(dim=-1, keepdim=True)

    def classify(self, image: Image.Image, top_k: int = 3) -> List[CategoryPrediction]:
        self._load()
        tensor = self.preprocess(image.convert("RGB")).unsqueeze(0).to(self.device)

        with torch.no_grad():
            image_features = self.model.encode_image(tensor)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            probs = (100 * image_features @ self.text_features.T).softmax(dim=-1)[0]

        values, indices = probs.topk(min(top_k, len(self.ids)))
        result: List[CategoryPrediction] = []
        for value, index in zip(values.tolist(), indices.tolist()):
            category_id = self.ids[index]
            result.append(
                CategoryPrediction(
                    id=category_id,
                    label=CATEGORY_LABELS[category_id],
                    score=round(float(value), 4),
                )
            )
        return result


clip_engine = CLIPEngine()
