import json
from core.orchestrator import load_citizen_profile
from core.retriever import retrieve
from core.conflict import detect_conflicts
from core.synthesizer import synthesize

# ── CONFIG ─────────────────────────────────────────────
RUN_INGEST = True
RESET_DB   = True
USER_ID    = "7b8be66f-4dec-41e5-96b0-47a4ef3bb3a5"
# ───────────────────────────────────────────────────────


def print_divider(char="─", width=65):
    print(char * width)

def print_header(title):
    print()
    print_divider("═")
    print(f"  {title}")
    print_divider("═")

def print_section(title):
    print()
    print_divider("─")
    print(f"  {title}")
    print_divider("─")


def run_pipeline(user_id: str):

    # ── STEP 0: FETCH + BUILD PROFILE ──────────────────
    print_header("STEP 0 — CITIZEN PROFILE (from backend API)")
    profile = load_citizen_profile(user_id)

    print_section("Profile Summary")
    print(f"  Name             : {profile.get('name', 'N/A')}")
    print(f"  Age              : {profile.get('age', 'N/A')} years")
    print(f"  Gender           : {profile.get('gender', 'N/A')}")
    print(f"  State            : {profile.get('state', 'N/A')}")
    print(f"  District         : {profile.get('district', 'N/A')}")
    print(f"  Caste category   : {profile.get('caste_category', 'N/A')}")
    print(f"  Annual income    : ₹{profile.get('annual_income_inr', 'N/A'):,}" if profile.get('annual_income_inr') else "  Annual income    : N/A")
    print(f"  BPL card         : {'Yes' if profile.get('bpl_card') else 'No'}")
    print(f"  Disability       : {'Yes' if profile.get('disability') else 'No'}")
    print(f"  Occupation       : {profile.get('occupation', 'N/A')}")
    print(f"  Land holding     : {profile.get('land_acres', 0)} acres")
    print(f"  Crop type        : {profile.get('crop_type', 'N/A')}")
    print(f"  Irrigation       : {'Yes' if profile.get('irrigation') else 'No'}")
    print(f"  Farm income      : ₹{profile.get('farm_income', 'N/A'):,}" if profile.get('farm_income') else "  Farm income      : N/A")
    print(f"  Livestock        : {'Yes' if profile.get('livestock') else 'No'}")
    print(f"  Need categories  : {', '.join(profile.get('need_categories', []))}")
    print(f"  Documents        : {', '.join(profile.get('documents_available', []))}")
    print(f"  Preferred lang   : {profile.get('language', 'en')}")

    if not profile.get("state"):
        print("\n  WARNING: State is missing — retrieval accuracy will be reduced.")
    if not profile.get("need_categories"):
        print("\n  WARNING: No need categories found — broad search will be used.")

    # ── STEP 1: RETRIEVAL ───────────────────────────────
    print_header("STEP 1 — SEMANTIC RETRIEVAL")
    print("  Generating targeted queries from citizen profile...")
    print("  Running cosine similarity search across indexed chunks...")
    print()

    chunks = retrieve(profile)

    print_section(f"Retrieved {len(chunks)} most relevant scheme chunks")
    for i, c in enumerate(chunks, 1):
        m = c["metadata"]
        score_label = "STRONG" if c["score"] >= 0.65 else "MODERATE" if c["score"] >= 0.50 else "WEAK"
        print(f"\n  [{i}] {score_label} match — Score: {c['score']:.3f}")
        print(f"       Scheme  : {m['scheme_name']}")
        print(f"       Level   : {m['level'].upper()} | State: {m['state']}")
        print(f"       Source  : {m['source_pdf']}")
        print(f"       Page    : {m['page']} | Clause: {m['clause']}")
        print(f"       Query   : {c['matched_query']}")
        print(f"       Extract : {c['text'][:250]}...")

    score_list = [c["score"] for c in chunks]
    strong   = sum(1 for s in score_list if s >= 0.65)
    moderate = sum(1 for s in score_list if 0.50 <= s < 0.65)
    weak     = sum(1 for s in score_list if s < 0.50)

    print_section("Retrieval Quality Summary")
    print(f"  Total chunks retrieved : {len(chunks)}")
    print(f"  Strong matches (≥0.65) : {strong}")
    print(f"  Moderate (0.50–0.65)   : {moderate}")
    print(f"  Weak (<0.50)           : {weak}")
    print(f"  Average score          : {sum(score_list)/len(score_list):.3f}" if score_list else "  Average score : N/A")
    print(f"  Highest score          : {max(score_list):.3f}" if score_list else "")
    print(f"  Lowest score           : {min(score_list):.3f}" if score_list else "")

    # ── STEP 2: CONFLICT DETECTION ──────────────────────
    print_header("STEP 2 — CONFLICT DETECTION")
    conflicts = detect_conflicts(chunks)

    if conflicts:
        print_section(f"  {len(conflicts)} conflict(s) detected")
        for i, c in enumerate(conflicts, 1):
            print(f"\n  [Conflict {i}]")
            print(f"  Scheme         : {c['scheme_name']}")
            print(f"  What conflicts : {c['conflict_summary']}")
            print(f"  Central says   : {c['central_says']}")
            print(f"  State says     : {c['state_says']}")
            print(f"  Central source : {c['central_source']}")
            print(f"  State source   : {c['state_source']}")
    else:
        print("  No conflicts detected.")

    # ── STEP 3: LLM SYNTHESIS ───────────────────────────
    from config import MODEL_NAME
    print_header(f"STEP 3 — LLM SYNTHESIS ({MODEL_NAME})")
    result = synthesize(profile, chunks, conflicts)

    # ── MATCHED SCHEMES ─────────────────────────────────
    matched = result.get("matched_schemes", [])
    print_section(f"Matched Schemes — {len(matched)} scheme(s) found")

    if not matched:
        print("  No schemes matched this citizen's profile.")
    else:
        for i, s in enumerate(matched, 1):
            print(f"\n  ┌─ Scheme {i} {'─'*45}")
            print(f"  │  Name        : {s.get('scheme_name', 'N/A')}")
            print(f"  │  Level       : {s.get('level', 'N/A').upper()} — applies to: {s.get('state', 'N/A')}")
            print(f"  │")
            print(f"  │  BENEFIT")
            benefit = s.get('benefit', 'Not specified in source document')
            for line in [benefit[j:j+55] for j in range(0, len(benefit), 55)]:
                print(f"  │    {line}")
            print(f"  │")
            print(f"  │  WHY ELIGIBLE")
            why = s.get('why_eligible', 'N/A')
            for line in [why[j:j+55] for j in range(0, len(why), 55)]:
                print(f"  │    {line}")
            print(f"  │")
            print(f"  │  ELIGIBILITY CRITERIA MET")
            for criterion in s.get('eligibility_criteria_met', []):
                print(f"  │    ✓ {criterion}")
            print(f"  │")
            print(f"  │  SOURCE CITATION")
            print(f"  │    {s.get('citation', 'N/A')}")
            print(f"  └─{'─'*50}")

    # ── APPLICATION CHECKLISTS ──────────────────────────
    checklists = result.get("application_checklists", [])
    print_section(f"Application Checklists — {len(checklists)} checklist(s)")
    for i, c in enumerate(checklists, 1):
        print(f"\n  ┌─ Checklist {i}: {c.get('scheme_name', 'N/A')} {'─'*30}")
        print(f"  │  DOCUMENTS NEEDED")
        for doc in c.get("documents_needed", []):
            print(f"  │    • {doc}")
        print(f"  │  OFFICES TO VISIT")
        for office in c.get("offices_to_visit", []):
            print(f"  │    • {office}")
        print(f"  │  APPLICATION STEPS")
        for step in c.get("steps", []):
            print(f"  │    {step}")
        print(f"  │  DEADLINE: {c.get('deadline', 'Not specified')}")
        print(f"  └─{'─'*50}")

    # ── CONFLICTS ────────────────────────────────────────
    output_conflicts = result.get("conflicts", [])
    if output_conflicts:
        print_section(f"Conflicts — {len(output_conflicts)}")
        for i, c in enumerate(output_conflicts, 1):
            print(f"\n  [Conflict {i}] {c.get('scheme_name', 'N/A')}")
            print(f"  {c.get('conflict_summary', 'N/A')}")

    # ── SCHEMES NOT ELIGIBLE ─────────────────────────────
    not_eligible = result.get("schemes_not_eligible", [])
    if not_eligible:
        print_section(f"Not Eligible — {len(not_eligible)}")
        for s in not_eligible:
            print(f"  ✗  {s}")

    # ── HINDI SUMMARY ────────────────────────────────────
    print_section("Plain Language Summary")
    hindi = result.get("hindi_summary", "N/A")
    for line in [hindi[j:j+65] for j in range(0, len(hindi), 65)]:
        print(f"  {line}")

    # ── FINAL JSON ───────────────────────────────────────
    print_section("Full Structured JSON Output")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    print()
    print_divider("═")
    print(f"  Pipeline complete for citizen: {profile.get('name', user_id)}")
    print(f"  Schemes matched    : {len(matched)}")
    print(f"  Conflicts flagged  : {len(output_conflicts)}")
    print(f"  Chunks used        : {len(chunks)}")
    print_divider("═")
    print()

    return result


if __name__ == "__main__":
    if RUN_INGEST:
        from core.ingestor import ingest_all_pdfs
        from core.embedder import store_chunks
        print("=== REBUILDING INDEX ===")
        chunks = ingest_all_pdfs("data/schemes")
        store_chunks(chunks, reset=RESET_DB)
        print(f"Index rebuilt. Total chunks: {len(chunks)}")
        print("Now set RUN_INGEST = False and run again.\n")
    else:
        run_pipeline(USER_ID)
