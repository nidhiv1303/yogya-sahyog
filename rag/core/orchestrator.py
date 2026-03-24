import json
import requests
from huggingface_hub import InferenceClient
from config import HF_API_KEY, MODEL_NAME, BACKEND_BASE_URL, MAX_TOKENS_OCR

client = InferenceClient(api_key=HF_API_KEY)


def fetch_citizen_data(user_id: str) -> dict:
    url = f"{BACKEND_BASE_URL}/citizen-data/{user_id}"
    print(f"  Fetching from: {url}")
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    print(f"  Response keys: {list(data.keys())}")
    return data


def extract_latest_submission(api_data: dict) -> dict:
    if "submissions" in api_data:
        submissions = api_data.get("submissions", [])
        if not submissions:
            raise ValueError("No submissions found for this user.")
        submissions_sorted = sorted(
            submissions,
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )
        latest = submissions_sorted[0]
        print(f"  Found {len(submissions)} submission(s). Using latest: "
              f"{latest.get('created_at', 'unknown date')}")
        inner = latest.get("data", {})
        inner["submission_id"] = latest.get("submission_id")
        inner["created_at"]    = latest.get("created_at")
        return inner
    return api_data


def map_to_profile(api_data: dict) -> dict:
    if "general_info" in api_data:
        general  = api_data.get("general_info", {})
        category = api_data.get("category_details", {})
        docs     = api_data.get("documents", {})
        name_key = "full_name"
    elif "basic_profile" in api_data:
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

    documents_available = []
    for doc_key, doc_val in docs.items():
        if doc_val:
            if isinstance(doc_val, dict) and doc_val.get("file_path"):
                documents_available.append(doc_key)
            elif doc_val:
                documents_available.append(doc_key)

    need_raw = general.get("need_category", "")
    if isinstance(need_raw, list):
        need_categories = need_raw
    elif isinstance(need_raw, str) and need_raw:
        need_categories = [need_raw]
    else:
        need_categories = []

    ocr_texts = []
    for doc_key, doc_val in docs.items():
        if isinstance(doc_val, dict) and doc_val.get("extracted_text"):
            ocr_texts.append(f"[{doc_key.upper()}]\n{doc_val['extracted_text']}")
    combined_ocr = "\n\n".join(ocr_texts)

    employment = general.get("employment_type", "")
    if "agriculture" in need_categories or employment.lower() == "farmer":
        occupation = "farmer"
    else:
        occupation = employment.lower() if employment else "unknown"

    profile = {
        "user_id":        api_data.get("user_id"),
        "submission_id":  api_data.get("submission_id"),
        "email":          api_data.get("email"),
        "name":           general.get(name_key) or general.get("full_name") or general.get("name"),
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
        "annual_income_inr": general.get("annual_income"),
        "employment_type":   general.get("employment_type"),
        "bpl_card":          general.get("bpl_card", False),
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
        "need_categories":     need_categories,
        "documents_available": documents_available,
        "ocr_text":            combined_ocr,
    }

    profile = {k: v for k, v in profile.items() if v is not None}
    return profile


def enrich_profile_with_ocr(profile: dict) -> dict:
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
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=MAX_TOKENS_OCR
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
    print(f"\n=== LOADING CITIZEN PROFILE: {user_id} ===")
    api_data   = fetch_citizen_data(user_id)
    submission = extract_latest_submission(api_data)
    profile    = map_to_profile(submission)

    print(f"  Mapped {len(profile)} fields")
    print(f"  Name   : {profile.get('name', 'N/A')}")
    print(f"  State  : {profile.get('state', 'N/A')}")
    print(f"  Income : ₹{profile.get('annual_income_inr', 0):,}")
    print(f"  Land   : {profile.get('land_acres', 0)} acres")
    print(f"  Needs  : {profile.get('need_categories', [])}")

    profile = enrich_profile_with_ocr(profile)
    return profile
