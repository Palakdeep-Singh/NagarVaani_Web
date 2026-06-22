"""
intent.py — NagarVaani Intent Classifier
Compatible with your trained model (TokenizersBackend + BertForSequenceClassification)

Your model config:
  Architecture : BertForSequenceClassification
  Vocab size   : 250,000
  Hidden size  : 768 (12 layers)
  Labels       : 7 intents
  Tokenizer    : TokenizersBackend (auto-patched)
"""

import os
import re
import json
import torch
import functools
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_PATH = os.getenv("INTENT_MODEL_PATH", "models/nagarvaani-intent-v1")
MAX_LENGTH = 128
THRESHOLD  = 0.50 # Lowered from 0.65 for better reach

# From your config.json — hardcoded for reliability
ID2LABEL = {
    0: "SCHEME_QUERY",
    1: "GRIEVANCE_FILE",
    2: "STATUS_CHECK",
    3: "BOOTH_CHANGE",
    4: "DOC_UPLOAD",
    5: "RE_REGISTER",
    6: "GREET"
}
LABEL2ID = {v: k for k, v in ID2LABEL.items()}


@functools.lru_cache(maxsize=1)
def _load():
    print(f"[AI] Loading model from: {MODEL_PATH}")

    # Patch tokenizer_config if TokenizersBackend
    tok_cfg_path = Path(MODEL_PATH) / "tokenizer_config.json"
    if tok_cfg_path.exists():
        with open(tok_cfg_path) as f:
            cfg = json.load(f)
        if cfg.get("tokenizer_class") == "TokenizersBackend":
            cfg["tokenizer_class"] = "PreTrainedTokenizerFast"
            with open(tok_cfg_path, "w") as f:
                json.dump(cfg, f, indent=2)
            print("[AI] Patched tokenizer_config.json")

    # Load tokenizer
    try:
        tok = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=True)
    except Exception as e:
        print(f"[AI] Fast tokenizer failed: {e} — trying slow")
        tok = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)

    # Load model
    mdl = AutoModelForSequenceClassification.from_pretrained(
        MODEL_PATH,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
        ignore_mismatched_sizes=True
    )
    mdl.eval()
    print("[AI] Model loaded — 7 intents ready")
    return tok, mdl


def preload():
    """Manually trigger model loading."""
    _load()


import asyncio

async def classify(text: str) -> dict:
    t = text.strip()

    # Hard rules (Fast, Sync)
    if re.search(r'(?i)grv[-\s]?\d{3,}', t):
        return {"intent": "STATUS_CHECK",  "confidence": 1.0, "show_menu": False}
    if re.match(r'^\d{12}$', t):
        return {"intent": "AADHAAR_INPUT", "confidence": 1.0, "show_menu": False}
    if re.match(r'^[1-7]$', t):
        return {"intent": f"MENU_{t}",     "confidence": 1.0, "show_menu": False}
    if t == "0":
        return {"intent": "MENU_0",        "confidence": 1.0, "show_menu": False}

    # BERT Inference (Heavy, Async Thread)
    return await asyncio.to_thread(_run_inference, t)


def _run_inference(t: str) -> dict:
    import time
    start = time.time()
    try:
        tok, mdl = _load()
        enc = tok(t, return_tensors="pt", truncation=True,
                  max_length=MAX_LENGTH, padding=True)
        with torch.no_grad():
            logits = mdl(**enc).logits
        probs = torch.softmax(logits, dim=-1)[0]
        pred  = torch.argmax(probs).item()
        conf  = probs[pred].item()
        dur = round(time.time() - start, 3)
        print(f"[AI] Inference took {dur}s for: '{t[:20]}...'")
        return {"intent": ID2LABEL[pred], "confidence": round(conf, 4),
                "show_menu": conf < THRESHOLD}
    except Exception as e:
        print(f"[AI] Error: {e}")
        return _keyword_fallback(t)


def _keyword_fallback(text: str) -> dict:
    t = text.lower()
    # Scheme Application / Registration
    if any(w in t for w in ["yojana","scheme","subsidy","apply","register","pajikaran","labh","benefit","pension","scholarship","loan","mili","ayega","form"]):
        return {"intent": "SCHEME_QUERY",   "confidence": 0.7, "show_menu": False}
    # Cancel / Stop
    if any(w in t for w in ["cancel","stop","radd","chodo","exit","vapas","bhul jao","menu","0"]):
        return {"intent": "MENU",           "confidence": 0.8, "show_menu": False}
    # Grievance
    if any(w in t for w in ["nahi","band","kharab","toot","problem","shikayat","complaint","broken","no water","bijli","paani","sadak","light","ganda","ticket","janai"]):
        return {"intent": "GRIEVANCE_FILE", "confidence": 0.7, "show_menu": False}
    if any(w in t for w in ["status","track","kya hua","update","grv","resolve","kaha tak","pahunche", "check complaint"]):
        return {"intent": "STATUS_CHECK",   "confidence": 0.7, "show_menu": False}
    if any(w in t for w in ["address","shift","moved","badal","ward","booth","pata","location", "change address"]):
        return {"intent": "BOOTH_CHANGE",   "confidence": 0.7, "show_menu": False}
    if any(w in t for w in ["document","certificate","proof","upload","bhejo","photo","kagaz","parchar", "file", "attach"]):
        return {"intent": "DOC_UPLOAD",     "confidence": 0.7, "show_menu": False}
    if any(w in t for w in ["phone kho","sim","naya number","stolen","lost","chori","gum", "badal", "change number"]):
        return {"intent": "RE_REGISTER",    "confidence": 0.7, "show_menu": False}
    if any(w in t for w in ["profile","details","activity","my info","mera detail","mera profile","shikayat list", "merestatus", "user details"]):
        return {"intent": "USER_DETAILS",   "confidence": 0.8, "show_menu": False}
    if any(w in t for w in ["help","madad","kaise","how to","kya karu","guide"]):
        return {"intent": "GREET",          "confidence": 0.8, "show_menu": True}
    return {"intent": "GREET", "confidence": 0.5, "show_menu": True}
