"""
Central config — loads .env once and exposes typed constants.
All modules import from here instead of hardcoding values.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# ── Model & API ────────────────────────────────────────────
HF_API_KEY   = os.getenv("HF_API_KEY", "")
MODEL_NAME   = os.getenv("MODEL_NAME", "deepseek-ai/DeepSeek-V3-0324")

# ── Backend ────────────────────────────────────────────────
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://192.168.16.86:8000")

# ── ChromaDB ───────────────────────────────────────────────
_chroma_raw  = os.getenv("CHROMA_PATH", "./db/chroma")
CHROMA_PATH  = str(Path(__file__).parent / _chroma_raw) if not Path(_chroma_raw).is_absolute() else _chroma_raw
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "scheme_chunks")

# ── RAG tuning ─────────────────────────────────────────────
USER_INTENT_WEIGHT   = float(os.getenv("USER_INTENT_WEIGHT",   "2.0"))
RETRIEVAL_THRESHOLD  = float(os.getenv("RETRIEVAL_THRESHOLD",  "0.45"))
TOP_K_PER_QUERY      = int(os.getenv("TOP_K_PER_QUERY",        "6"))
FINAL_TOP_K          = int(os.getenv("FINAL_TOP_K",            "15"))

# ── Token limits ───────────────────────────────────────────
MAX_TOKENS_INTENT          = int(os.getenv("MAX_TOKENS_INTENT",          "250"))
MAX_TOKENS_CHAT            = int(os.getenv("MAX_TOKENS_CHAT",            "200"))
MAX_TOKENS_SCHEME_QUERY    = int(os.getenv("MAX_TOKENS_SCHEME_QUERY",    "350"))
MAX_TOKENS_SPECIFIC_SCHEME = int(os.getenv("MAX_TOKENS_SPECIFIC_SCHEME", "600"))
MAX_TOKENS_LEGAL           = int(os.getenv("MAX_TOKENS_LEGAL",           "700"))
MAX_TOKENS_CARD            = int(os.getenv("MAX_TOKENS_CARD",            "600"))
MAX_TOKENS_SYNTHESIS       = int(os.getenv("MAX_TOKENS_SYNTHESIS",       "2500"))
MAX_TOKENS_OCR             = int(os.getenv("MAX_TOKENS_OCR",             "150"))
MAX_TOKENS_CONFLICT        = int(os.getenv("MAX_TOKENS_CONFLICT",        "300"))
