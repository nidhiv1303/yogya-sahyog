import json
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="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")


def format_chunks_for_prompt(chunks: list) -> str:
    formatted = []
    for i, chunk in enumerate(chunks, 1):
        m = chunk["metadata"]
        formatted.append(
            f"[CHUNK {i}]\n"
            f"Scheme : {m['scheme_name']}\n"
            f"Level  : {m['level']} | State: {m['state']}\n"
            f"Source : {m['source_pdf']} | Page {m['page']} | {m['clause']}\n"
            f"Text   :\n{chunk['text']}\n"
        )
    return "\n---\n".join(formatted)


def synthesize(profile: dict, chunks: list, conflicts: list) -> dict:

    chunks_text   = format_chunks_for_prompt(chunks)
    conflict_text = json.dumps(conflicts, indent=2) if conflicts else "None detected."

    # Build a strict eligibility summary from actual profile values
    eligibility_facts = f"""
CITIZEN FACTS TO MATCH AGAINST (use these exact values for eligibility checking):
- Name              : {profile.get('name', 'Unknown')}
- Age               : {profile.get('age', 'unknown')} years
- Gender            : {profile.get('gender', 'unknown')}
- State             : {profile.get('state', 'unknown')}
- Caste category    : {profile.get('caste_category', 'unknown')}
- Annual income     : INR {profile.get('annual_income_inr', 'unknown')}
- BPL card holder   : {profile.get('bpl_card', False)}
- Disability        : {profile.get('disability', False)}
- Occupation        : {profile.get('occupation', 'unknown')}
- Land holding      : {profile.get('land_acres', 0)} acres
- Crop type         : {profile.get('crop_type', 'unknown')}
- Irrigation access : {profile.get('irrigation', False)}
- Farm income       : INR {profile.get('farm_income', 'unknown')}
- Livestock         : {profile.get('livestock', False)}
- Family size       : {profile.get('family_size', 'unknown')}
- Need categories   : {', '.join(profile.get('need_categories', []))}
- Documents held    : {', '.join(profile.get('documents_available', []))}
"""

    system_prompt = """You are PolicyPilot, an AI that matches Indian citizens to government welfare schemes.

STRICT RULES — every rule is mandatory:
1. ONLY recommend schemes whose eligibility criteria are EXPLICITLY stated in the provided chunks.
2. CHECK each eligibility criterion against the citizen's actual values provided.
3. If a scheme has an income ceiling — verify citizen's income is BELOW it.
4. If a scheme has a land ceiling — verify citizen's land is BELOW it.
5. If a scheme is for a specific caste — verify citizen belongs to that caste.
6. If a scheme is for a specific gender — verify citizen's gender matches.
7. NEVER recommend a scheme if the citizen fails even one eligibility criterion.
8. NEVER use the same output for different citizens — output must reflect THIS citizen's exact values.
9. Cite the exact PDF name and clause for every recommendation.
10. Return ONLY valid JSON. No markdown, no text outside the JSON."""

    user_prompt = f"""{eligibility_facts}

RETRIEVED SCHEME CLAUSES FROM OFFICIAL PDFs:
{chunks_text}

DETECTED CONFLICTS:
{conflict_text}

TASK: For each chunk, carefully check if THIS citizen meets ALL eligibility criteria.
Then generate the JSON response below.

IMPORTANT: The "why_eligible" field MUST mention the citizen's actual name and actual values.
Example: "Ramesh Kumar earns INR 120,000 which is below the PM-KISAN income threshold."
NOT: "The citizen's income is below the threshold."

Return this exact JSON structure:
{{
  "matched_schemes": [
    {{
      "scheme_name": "Full official scheme name",
      "level": "central or state",
      "state": "all or state name",
      "why_eligible": "Explain using citizen's ACTUAL name and ACTUAL values from their profile",
      "benefit": "Exact benefit amount or service from the PDF",
      "eligibility_criteria_met": [
        "Criterion 1: citizen value vs scheme requirement",
        "Criterion 2: citizen value vs scheme requirement"
      ],
      "citation": "exact PDF filename | page number | clause"
    }}
  ],
  "application_checklists": [
    {{
      "scheme_name": "Same name as above",
      "documents_needed": ["list of documents"],
      "offices_to_visit": ["list of offices"],
      "steps": ["Step 1: ...", "Step 2: ..."],
      "deadline": "deadline or Rolling"
    }}
  ],
  "conflicts": [
    {{
      "scheme_name": "name",
      "conflict_summary": "what contradicts",
      "central_says": "central criterion",
      "state_says": "state criterion",
      "central_source": "pdf and clause",
      "state_source": "pdf and clause",
      "recommendation": "action for citizen"
    }}
  ],
  "schemes_not_eligible": [
    "Scheme X — reason: citizen income INR 120000 exceeds ceiling of INR 80000"
  ],
  "hindi_summary": "नागरिक {profile.get('name', '')} के लिए सरल हिंदी में योजनाओं का सारांश।"
}}"""

    print("  Calling LLM for grounded synthesis...")
    print(f"  Citizen: {profile.get('name')} | "
          f"Income: ₹{profile.get('annual_income_inr', 0):,} | "
          f"State: {profile.get('state')} | "
          f"Land: {profile.get('land_acres', 0)} acres")

    response = client.chat.completions.create(
        model="Qwen/Qwen2.5-72B-Instruct",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        max_tokens=3000,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"  JSON parse error: {e}")
        print(f"  Raw response:\n{raw[:500]}")
        return {"error": "Failed to parse LLM response", "raw": raw}