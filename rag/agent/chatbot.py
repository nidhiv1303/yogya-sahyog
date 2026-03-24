import json
import requests
from huggingface_hub import InferenceClient
from config import (
    HF_API_KEY, MODEL_NAME, BACKEND_BASE_URL,
    MAX_TOKENS_INTENT, MAX_TOKENS_CHAT, MAX_TOKENS_SCHEME_QUERY,
    MAX_TOKENS_SPECIFIC_SCHEME, MAX_TOKENS_LEGAL, MAX_TOKENS_CARD,
)

client = InferenceClient(api_key=HF_API_KEY)


# ── INTENT CLASSIFIER ─────────────────────────────────────
def classify_intent(message: str, conversation_history: list) -> dict:
    history_text = ""
    if conversation_history:
        last_3 = conversation_history[-6:]
        history_text = "\n".join([
            f"{'User' if m['role'] == 'user' else 'Bot'}: {m['content']}"
            for m in last_3
        ])

    prompt = f"""You are an intent classifier for a government scheme chatbot called PolicyPilot.

CONVERSATION HISTORY:
{history_text if history_text else "No previous messages."}

CURRENT USER MESSAGE:
"{message}"

Classify into ONE intent:
1. CASUAL_CHAT — greetings, thank you, general chat
2. SCHEME_NEED — user describes a need/problem/situation that may qualify for welfare
3. SCHEME_QUERY — user asks about schemes in general
4. PROVIDE_INFO — user gives personal info (age, income, state, etc.)
5. SPECIFIC_SCHEME — user asks about ONE named scheme in detail
6. LEGAL_RIGHTS — user asks about laws, rights, or someone breaking a law against them
7. CARD_INFO — user asks how to get a government card/document

Return ONLY valid JSON:
{{
  "intent": "CASUAL_CHAT|SCHEME_NEED|SCHEME_QUERY|PROVIDE_INFO|SPECIFIC_SCHEME|LEGAL_RIGHTS|CARD_INFO",
  "confidence": "HIGH|MEDIUM|LOW",
  "trigger_rag": true or false,
  "reason": "one sentence",
  "scheme_name": "if SPECIFIC_SCHEME, the scheme name, else null",
  "legal_topic": "if LEGAL_RIGHTS, the topic, else null",
  "card_type": "if CARD_INFO, the card type, else null",
  "extracted_info": {{
    "occupation": "if mentioned",
    "state": "if mentioned",
    "income": "if mentioned as number",
    "land_acres": "if mentioned as number",
    "age": "if mentioned as number",
    "caste_category": "if mentioned",
    "need_categories": ["agriculture", "health", "education", "housing", "employment"],
    "problem_described": "brief summary of problem if described"
  }}
}}

Set trigger_rag to true ONLY for SCHEME_NEED or SCHEME_QUERY with HIGH or MEDIUM confidence.
For SPECIFIC_SCHEME, LEGAL_RIGHTS, and CARD_INFO — always set trigger_rag to false."""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=MAX_TOKENS_INTENT,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except Exception:
        return {
            "intent": "CASUAL_CHAT",
            "confidence": "LOW",
            "trigger_rag": False,
            "reason": "Failed to parse intent",
            "scheme_name": None,
            "legal_topic": None,
            "card_type": None,
            "extracted_info": {}
        }


# ── CASUAL CHAT ───────────────────────────────────────────
def handle_casual_chat(message: str, conversation_history: list) -> str:
    system = """You are PolicyPilot, a friendly AI that helps Indian citizens find government schemes.
For casual conversation, be warm and concise — 2-3 sentences max.
If the user seems to have a need, gently ask about their situation.
Always respond in the same language the user is using."""

    messages = [{"role": "system", "content": system}]
    for msg in conversation_history[-10:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=MAX_TOKENS_CHAT,
    )
    return response.choices[0].message.content.strip()


# ── SCHEME QUERY ──────────────────────────────────────────
def handle_scheme_query(message: str, extracted_info: dict, conversation_history: list) -> str:
    missing = []
    if not extracted_info.get("state"):
        missing.append("which state you live in")
    if not extracted_info.get("occupation"):
        missing.append("your occupation")
    if not extracted_info.get("income"):
        missing.append("your annual income")

    if missing and len(missing) >= 2:
        missing_str = " and ".join(missing[:2])
        return (
            f"I can help you find the right government schemes! "
            f"To give you accurate results, could you tell me {missing_str}? "
            f"The more details you share, the better I can match schemes for you."
        )

    system = """You are PolicyPilot, an expert on Indian government welfare schemes.
Answer questions accurately. If the user needs personalised matching, ask for their profile details.
Keep responses clear and in the language the user is using."""

    messages = [{"role": "system", "content": system}]
    for msg in conversation_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=MAX_TOKENS_SCHEME_QUERY,
    )
    return response.choices[0].message.content.strip()


# ── SPECIFIC SCHEME ───────────────────────────────────────
def handle_specific_scheme(message: str, scheme_name: str, conversation_history: list) -> str:
    system = """You are PolicyPilot, an expert on Indian government welfare schemes.
The user is asking about ONE specific scheme. Provide complete, accurate information:
- Official full name and ministry/department
- Objective / purpose
- Who is eligible (income, caste, land, age, gender criteria)
- Benefits provided (amount, type, frequency)
- How to apply (steps, offices, online portal)
- Documents required
- Deadline or rolling applications
- Official website or helpline if known

Use bullet points for eligibility and documents.
Respond in the same language the user is using.
Do NOT suggest other schemes — focus only on what was asked."""

    messages = [{"role": "system", "content": system}]
    for msg in conversation_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=MAX_TOKENS_SPECIFIC_SCHEME,
    )
    return response.choices[0].message.content.strip()


# ── LEGAL RIGHTS ──────────────────────────────────────────
def handle_legal_rights(message: str, legal_topic: str, conversation_history: list) -> str:
    system = """You are PolicyPilot, a knowledgeable legal guide for Indian citizens.
When a user asks about legal rights or reports a law being broken:
1. Identify relevant Indian laws/acts.
2. State constitutional rights involved (with Article numbers).
3. List relevant amendments or key provisions.
4. Explain step-by-step what the citizen can do:
   - Who to complain to (police, district magistrate, labour court, consumer forum)
   - Which section of the law applies
   - Whether to file FIR, RTI, or go to a tribunal
5. Mention government schemes, legal aid, or free services (e.g., NALSA helpline: 15100).
6. Keep it simple — the user may not have legal education.
7. Always add: "This is general legal guidance. For your specific case, consult a lawyer
   or contact NALSA helpline: 15100"

Respond in the same language the user is using."""

    messages = [{"role": "system", "content": system}]
    for msg in conversation_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=MAX_TOKENS_LEGAL,
    )
    return response.choices[0].message.content.strip()


# ── CARD INFO ─────────────────────────────────────────────
def handle_card_info(message: str, card_type: str, conversation_history: list) -> str:
    system = """You are PolicyPilot, an expert guide on Indian government cards and documents.
When a user asks how to get any government card or document, provide:
1. Official name and issuing authority
2. Who is eligible / who can apply
3. Step-by-step process (online portal + offline office)
4. Documents required (originals + photocopies)
5. Fees if any
6. How long it takes
7. Helpline or grievance number

Cover: Aadhaar, PAN, Voter ID, Ration Card, Driving Licence, Passport, Ayushman Card,
Kisan Credit Card, Jan Dhan, E-Shram, BOCW, UDID, Caste/Income/Domicile certificates, etc.

Mention CSC (Common Service Centre) as an easy option for rural citizens.
Respond in the same language the user is using."""

    messages = [{"role": "system", "content": system}]
    for msg in conversation_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=MAX_TOKENS_CARD,
    )
    return response.choices[0].message.content.strip()


# ── RAG PIPELINE TRIGGER ──────────────────────────────────
def trigger_rag_pipeline(user_id: str, user_intent_text: str = None) -> str:
    """
    Run the full RAG pipeline.
    user_intent_text is the raw user message — passed to retriever as max-weight query.
    """
    from core.orchestrator import load_citizen_profile
    from core.retriever import retrieve
    from core.conflict import detect_conflicts
    from core.synthesizer import synthesize

    try:
        print("\n  [Agent] Triggering RAG pipeline...")

        profile   = load_citizen_profile(user_id)
        # Pass user's raw intent so retriever gives it max weight (2.0)
        chunks    = retrieve(profile, user_intent_text=user_intent_text)
        conflicts = detect_conflicts(chunks)
        result    = synthesize(profile, chunks, conflicts)

        matched = result.get("matched_schemes", [])
        hindi   = result.get("hindi_summary", "")

        if not matched:
            return (
                "I searched through government scheme documents but "
                "couldn't find schemes that exactly match your profile. "
                "Could you tell me your state, income, and occupation?"
            )

        lines = [f"Great news! Based on your profile, I found "
                 f"**{len(matched)} scheme(s)** you may qualify for:\n"]

        for i, s in enumerate(matched, 1):
            lines.append(f"**{i}. {s.get('scheme_name', 'N/A')}**")
            lines.append(f"   Benefit  : {s.get('benefit', 'N/A')}")
            lines.append(f"   Why you  : {s.get('why_eligible', 'N/A')}")
            lines.append(f"   Source   : {s.get('citation', 'N/A')}")
            lines.append("")

        if result.get("conflicts"):
            lines.append(
                "Note: I found conflicting information between central and state "
                "versions of one or more schemes. Please verify with your District Collector office."
            )
            lines.append("")

        if result.get("application_checklists"):
            lines.append("Would you like the step-by-step application process for any of these?")

        if hindi:
            lines.append(f"\n**हिंदी सारांश:** {hindi}")

        return "\n".join(lines)

    except Exception as e:
        print(f"  [Agent] RAG pipeline error: {e}")
        return "I ran into an issue searching for schemes. Please try again in a moment."


# ── PROFILE COLLECTOR ─────────────────────────────────────
def collect_profile_info(extracted_info: dict, session: dict) -> dict:
    mapping = {
        "occupation":      "occupation",
        "state":           "state",
        "income":          "annual_income_inr",
        "land_acres":      "land_acres",
        "age":             "age",
        "caste_category":  "caste_category",
        "need_categories": "need_categories",
    }
    for src_key, dest_key in mapping.items():
        val = extracted_info.get(src_key)
        if val and val not in ("if mentioned", "", None):
            if dest_key in ("annual_income_inr", "land_acres", "age"):
                try:
                    val = float(val) if "." in str(val) else int(val)
                except (ValueError, TypeError):
                    continue
            session["collected_profile"][dest_key] = val
    return session


def has_enough_for_rag(session: dict) -> bool:
    p = session.get("collected_profile", {})
    return bool(
        p.get("state") and
        (p.get("occupation") or p.get("need_categories")) and
        p.get("annual_income_inr")
    )


# ── MAIN AGENT ────────────────────────────────────────────
class PolicyPilotAgent:

    def __init__(self, user_id: str = None):
        self.user_id = user_id
        self.conversation_history = []
        self.session = {
            "collected_profile": {},
            "rag_triggered":     False,
            "schemes_found":     [],
        }

    def chat(self, user_message: str) -> str:
        print(f"\n  [User] {user_message}")

        self.conversation_history.append({"role": "user", "content": user_message})

        intent_result = classify_intent(user_message, self.conversation_history)

        intent      = intent_result.get("intent", "CASUAL_CHAT")
        confidence  = intent_result.get("confidence", "LOW")
        trigger     = intent_result.get("trigger_rag", False)
        extracted   = intent_result.get("extracted_info", {})
        scheme_name = intent_result.get("scheme_name")
        legal_topic = intent_result.get("legal_topic")
        card_type   = intent_result.get("card_type")

        print(f"  [Agent] Intent: {intent} ({confidence}) | Trigger RAG: {trigger}")
        print(f"  [Agent] Reason: {intent_result.get('reason', '')}")

        if extracted:
            self.session = collect_profile_info(extracted, self.session)
            if self.session["collected_profile"]:
                print(f"  [Agent] Profile so far: {json.dumps(self.session['collected_profile'])}")

        reply = ""

        if intent == "LEGAL_RIGHTS":
            print(f"  [Agent] -> LEGAL handler | Topic: {legal_topic}")
            reply = handle_legal_rights(user_message, legal_topic, self.conversation_history)

        elif intent == "CARD_INFO":
            print(f"  [Agent] -> CARD handler | Card: {card_type}")
            reply = handle_card_info(user_message, card_type, self.conversation_history)

        elif intent == "SPECIFIC_SCHEME":
            print(f"  [Agent] -> SPECIFIC SCHEME handler | Scheme: {scheme_name}")
            reply = handle_specific_scheme(user_message, scheme_name, self.conversation_history)

        elif trigger and self.user_id:
            # Pass user's raw message as max-weight intent query to RAG
            reply = trigger_rag_pipeline(self.user_id, user_intent_text=user_message)
            self.session["rag_triggered"] = True

        elif trigger and has_enough_for_rag(self.session):
            print("  [Agent] -> RAG with collected profile")
            reply = self._run_rag_with_collected_profile(user_message)
            self.session["rag_triggered"] = True

        elif intent == "PROVIDE_INFO":
            reply = self._ask_for_missing_info()

        elif intent in ("SCHEME_NEED", "SCHEME_QUERY") and confidence == "LOW":
            reply = handle_scheme_query(user_message, extracted, self.conversation_history)

        else:
            reply = handle_casual_chat(user_message, self.conversation_history)

        self.conversation_history.append({"role": "assistant", "content": reply})
        print(f"  [Bot] {reply[:100]}...")
        return reply

    def _ask_for_missing_info(self) -> str:
        p = self.session["collected_profile"]
        if not p.get("state"):
            return "Which state do you live in? This helps me find state-specific schemes for you."
        if not p.get("annual_income_inr"):
            return "Could you share your approximate annual household income? This is needed to check income-based eligibility."
        if not p.get("occupation"):
            return "What is your occupation? For example — farmer, daily wage worker, student, unemployed, etc."
        if not p.get("need_categories"):
            return ("What kind of help are you looking for? "
                    "For example — agriculture support, health coverage, housing, education, or employment.")
        return "I have your basic details. Let me search for schemes that match your profile..."

    def _run_rag_with_collected_profile(self, user_intent_text: str = None) -> str:
        from core.retriever import retrieve
        from core.conflict import detect_conflicts
        from core.synthesizer import synthesize

        profile = self.session["collected_profile"]
        profile.setdefault("need_categories", [])
        profile.setdefault("documents_available", [])
        profile.setdefault("land_acres", 0)

        try:
            # Pass user's raw message as max-weight intent query
            chunks    = retrieve(profile, user_intent_text=user_intent_text)
            conflicts = detect_conflicts(chunks)
            result    = synthesize(profile, chunks, conflicts)
            matched   = result.get("matched_schemes", [])

            if not matched:
                return (
                    "I searched through the scheme database but couldn't find exact matches. "
                    "Could you provide more details like your state, income, and occupation?"
                )

            lines = [f"I found {len(matched)} scheme(s) for you:\n"]
            for i, s in enumerate(matched, 1):
                lines.append(f"{i}. {s.get('scheme_name')}")
                lines.append(f"   Benefit: {s.get('benefit', 'N/A')}")
                lines.append(f"   Why you qualify: {s.get('why_eligible', 'N/A')}")
                lines.append("")
            lines.append("Would you like the application steps for any of these?")
            return "\n".join(lines)

        except Exception as e:
            print(f"  [Agent] RAG error: {e}")
            return "I had trouble searching right now. Please try again."
