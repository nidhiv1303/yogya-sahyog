import fitz
import re
from pathlib import Path

STATE_NAMES = [
    "Gujarat", "Maharashtra", "Rajasthan", "Punjab", "Haryana",
    "UttarPradesh", "Uttar Pradesh", "Bihar", "WestBengal", "West Bengal",
    "Karnataka", "TamilNadu", "Tamil Nadu", "Kerala", "AndhraPradesh",
    "Andhra Pradesh", "Telangana", "Odisha", "Madhya Pradesh", "MadhyaPradesh",
    "Chhattisgarh", "Jharkhand", "Uttarakhand", "HimachalPradesh", "Himachal Pradesh",
    "Assam", "Delhi", "Goa"
]

CENTRAL_KEYWORDS = [
    "pradhan mantri", "pm ", "central government", "government of india",
    "ministry of", "national", "bharat", "india"
]


def detect_level_and_state(filename: str, first_page_text: str):
    combined = (filename + " " + first_page_text[:500]).lower()

    detected_state = "all"
    for state in STATE_NAMES:
        if state.lower() in combined:
            detected_state = state.replace(" ", "")
            break

    is_central = any(kw in combined for kw in CENTRAL_KEYWORDS)

    if detected_state != "all" and not is_central:
        level = "state"
    else:
        level = "central"

    return level, detected_state


def detect_clause(text: str) -> str:
    patterns = [
        r"(Section\s+\d+[\.\d]*)",
        r"(Clause\s+\d+[\.\d]*)",
        r"(\d+\.\d+[\.\d]*\s+[A-Z][^\n]{5,40})",
        r"(Article\s+\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return "General"


def extract_chunks_from_pdf(pdf_path: str, chunk_size: int = 400, overlap: int = 80):
    doc = fitz.open(pdf_path)
    filename = Path(pdf_path).stem

    first_page_text = doc[0].get_text() if len(doc) > 0 else ""
    level, state = detect_level_and_state(filename, first_page_text)

    scheme_name = re.sub(r'[_\-\s]+', '-', filename)
    scheme_name = re.sub(r'-\d{4}.*$', '', scheme_name)

    full_text = ""
    page_map = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        page_map.append((len(full_text), len(full_text) + len(text), page_num + 1))
        full_text += text + "\n"

    if not full_text.strip():
        print(f"  WARNING: No text extracted from {filename} (scanned PDF?)")
        return []

    words = full_text.split()
    step = chunk_size - overlap
    chunks = []

    for i in range(0, len(words), step):
        chunk_words = words[i: i + chunk_size]
        chunk_text = " ".join(chunk_words)
        if len(chunk_text.strip()) < 50:
            continue

        char_pos = len(" ".join(words[:i]))
        page_num = 1
        for start, end, pnum in page_map:
            if start <= char_pos < end:
                page_num = pnum
                break

        clause = detect_clause(chunk_text)

        chunks.append({
            "text": chunk_text.strip(),
            "metadata": {
                "scheme_name": scheme_name,
                "level": level,
                "state": state,
                "source_pdf": Path(pdf_path).name,
                "page": page_num,
                "clause": clause,
                "chunk_index": i // step,
            }
        })

    print(f"  [{scheme_name}] {len(chunks)} chunks | level={level} | state={state}")
    return chunks


def ingest_all_pdfs(data_dir: str = "data/schemes") -> list:
    all_chunks = []
    pdf_files = list(Path(data_dir).glob("*.pdf"))

    if not pdf_files:
        print(f"No PDFs found in {data_dir}")
        return []

    print(f"Found {len(pdf_files)} PDFs. Ingesting...")
    for idx, pdf_path in enumerate(pdf_files, 1):
        print(f"[{idx}/{len(pdf_files)}] {pdf_path.name}")
        try:
            chunks = extract_chunks_from_pdf(str(pdf_path))
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"  ERROR: {e}")

    print(f"\nTotal chunks extracted: {len(all_chunks)}")
    return all_chunks
