import json
import requests
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="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")

BACKEND_BASE_URL = "http://192.168.16.86:8000"


def fetch_citizen_data(user_id: str) -> dict:
    """Fetch raw citizen data from the backend API."""
    url = f"{BACKEND_BASE_URL}/citizen-data/{user_id}"
    print(f"  Fetching from: {url}")

    response = requests.get(url, timeout=10)
    response.raise_for_status()

    data = response.json()
    print(f"  Response keys: {list(data.keys())}")

    return data


def extract_latest_submission(api_data: dict) -> dict:
    """
    Backend now returns multiple submissions.
    Pick the most recent one (last in list).
    """
    # New structure: {user_id, total, submissions: [...]}
    if "submissions" in api_data:
        submissions = api_data.get("submissions", [])
        if not submissions:
            raise ValueError("No submissions found for this user.")

        # Sort by created_at and take the latest
        submissions_sorted = sorted(
            submissions,
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )
        latest = submissions_sorted[0]
        print(f"  Found {len(submissions)} submission(s). Using latest: "
              f"{latest.get('created_at', 'unknown date')}")

        # Return the inner data dict with submission_id attached
        inner = latest.get("data", {})
        inner["submission_id"] = latest.get("submission_id")
        inner["created_at"]    = latest.get("created_at")
        return inner

    # Old structure: direct flat response — return as-is
    return api_data


def map_to_profile(api_data: dict) -> dict:
    """
    Map backend response to RAG citizen profile.
    Handles both old structure (basic_profile) and
    new structure (general_info inside submissions).
    """

    # ── Detect which structure we have ──────────────────
    if "general_info" in api_data:
        # New structure
        general  = api_data.get("general_info", {})
        category = api_data.get("category_details", {})
        docs     = api_data.get("documents", {})
        name_key = "full_name"
    elif "basic_profile" in api_data:
        # Old structure
        general  = api_data.get("basic_profile", {})
        category = api_data.get("category_details", {})
        docs     = api_data.get("documents", {})
        name_key = "name"
    else:
        general  = {}
        category = {}
        docs     = {}
        name_key = "name"
        print("  WARNING: Unknown response structure — profile may be incomplete")

    # ── Documents available ──────────────────────────────
    documents_available = []
    for doc_key, doc_val in docs.items():
        if doc_val:
            if isinstance(doc_val, dict) and doc_val.get("file_path"):
                documents_available.append(doc_key)
            elif doc_val:
                documents_available.append(doc_key)
    if not documents_available:
        documents_available = []

    # ── Need categories ──────────────────────────────────
    need_raw = general.get("need_category", "")
    if isinstance(need_raw, list):
        need_categories = need_raw
    elif isinstance(need_raw, str) and need_raw:
        need_categories = [need_raw]
    else:
        need_categories = []

    # ── OCR text from documents ──────────────────────────
    ocr_texts = []
    for doc_key, doc_val in docs.items():
        if isinstance(doc_val, dict) and doc_val.get("extracted_text"):
            ocr_texts.append(
                f"[{doc_key.upper()}]\n{doc_val['extracted_text']}"
            )
    combined_ocr = "\n\n".join(ocr_texts)

    # ── Occupation logic ─────────────────────────────────
    employment = general.get("employment_type", "")
    if "agriculture" in need_categories or employment.lower() == "farmer":
        occupation = "farmer"
    else:
        occupation = employment.lower() if employment else "unknown"

    # ── Build final profile ──────────────────────────────
    profile = {
        # Identity
        "user_id":        api_data.get("user_id"),
        "submission_id":  api_data.get("submission_id"),
        "email":          api_data.get("email"),
        "name":           general.get(name_key) or general.get("full_name") or general.get("name"),

        # Demographics
        "age":            general.get("age"),
        "gender":         general.get("gender"),
        "state":          general.get("state"),
        "district":       general.get("district"),
        "village_city":   general.get("village_city"),
        "rural_urban":    general.get("rural_urban"),
        "caste_category": general.get("caste_category"),
        "religion":       general.get("religion"),
        "minority":       general.get("minority_status", False),
        "disability":     general.get("disability", False),
        "disability_type":general.get("disability_type"),
        "family_size":    general.get("family_size"),
        "marital_status": general.get("marital_status"),
        "language":       general.get("language", "en"),

        # Financial
        "annual_income_inr": general.get("annual_income"),
        "employment_type":   general.get("employment_type"),
        "bpl_card":          general.get("bpl_card", False),

        # Agriculture
        "occupation":     occupation,
        "land_acres":     category.get("land_acres", 0),
        "land_ownership": category.get("land_ownership"),
        "crop_type":      category.get("crop_type"),
        "irrigation":     category.get("irrigation", False),
        "farmer_id":      category.get("farmer_id"),
        "kisan_card":     category.get("kisan_card_no"),
        "livestock":      category.get("livestock", False),
        "livestock_count":category.get("livestock_count"),
        "farm_income":    category.get("farm_income"),
        "ration_card":    category.get("ration_card_no"),

        # Needs + docs
        "need_categories":     need_categories,
        "documents_available": documents_available,
        "ocr_text":            combined_ocr,
    }

    # Remove None values
    profile = {k: v for k, v in profile.items() if v is not None}

    return profile


def enrich_profile_with_ocr(profile: dict) -> dict:
    """Fill missing fields using OCR text if available."""
    ocr_text = profile.get("ocr_text", "")
    if not ocr_text:
        print("  No OCR text — skipping enrichment.")
        return profile

    missing_fields = [
        f for f in ["state", "age", "caste_category", "annual_income_inr"]
        if not profile.get(f)
    ]

    if not missing_fields:
        print("  Profile complete — skipping OCR enrichment.")
        return profile

    print(f"  OCR enrichment for: {missing_fields}")

    prompt = f"""Extract ONLY these missing fields from the OCR text: {missing_fields}

CURRENT PROFILE:
{json.dumps({k: v for k, v in profile.items() if k != 'ocr_text'}, indent=2)}

OCR TEXT:
{ocr_text}

Return ONLY valid JSON with the missing fields you found.
Example: {{"state": "Maharashtra"}}"""

    try:
        response = client.chat.completions.create(
            model="Qwen/Qwen2.5-72B-Instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        extracted = json.loads(raw.strip())
        for key, val in extracted.items():
            if val and not profile.get(key):
                profile[key] = val
                print(f"    OCR filled: {key} = {val}")
    except Exception as e:
        print(f"  OCR enrichment skipped: {e}")

    return profile


def load_citizen_profile(user_id: str) -> dict:
    """
    Full pipeline:
    1. Fetch from backend API
    2. Extract latest submission
    3. Map to RAG profile format
    4. Enrich with OCR if needed
    """
    print(f"\n=== LOADING CITIZEN PROFILE: {user_id} ===")

    # Step 1 — fetch
    api_data = fetch_citizen_data(user_id)

    # Step 2 — extract latest submission from list
    submission = extract_latest_submission(api_data)

    # Step 3 — map fields
    profile = map_to_profile(submission)
    print(f"  Mapped {len(profile)} fields")
    print(f"  Name   : {profile.get('name', 'N/A')}")
    print(f"  State  : {profile.get('state', 'N/A')}")
    print(f"  Income : ₹{profile.get('annual_income_inr', 0):,}")
    print(f"  Land   : {profile.get('land_acres', 0)} acres")
    print(f"  Needs  : {profile.get('need_categories', [])}")

    # Step 4 — enrich with OCR
    profile = enrich_profile_with_ocr(profile)

    return profile