import json
import os
from collections import defaultdict
from anthropic import Anthropic

client = Anthropic()


def group_by_scheme(chunks: list) -> dict:
    """Group retrieved chunks by scheme name."""
    groups = defaultdict(list)
    for chunk in chunks:
        scheme = chunk["metadata"].get("scheme_name", "Unknown")
        groups[scheme].append(chunk)
    return dict(groups)


def detect_conflicts(chunks: list) -> list:
    """
    For every scheme that has BOTH a central and a state chunk,
    ask the LLM if they contradict each other on eligibility.
    """
    scheme_groups = group_by_scheme(chunks)
    conflicts = []

    for scheme_name, scheme_chunks in scheme_groups.items():
        central_chunks = [c for c in scheme_chunks if c["metadata"].get("level") == "central"]
        state_chunks   = [c for c in scheme_chunks if c["metadata"].get("level") == "state"]

        # Only check when BOTH versions exist
        if not central_chunks or not state_chunks:
            continue

        central = central_chunks[0]
        state   = state_chunks[0]

        prompt = f"""You are checking if two government documents contradict each other on eligibility criteria.

CENTRAL DOCUMENT
Source : {central['metadata']['source_pdf']}
Clause : {central['metadata']['clause']}
Text   :
{central['text']}

STATE DOCUMENT ({state['metadata'].get('state', 'State')})
Source : {state['metadata']['source_pdf']}
Clause : {state['metadata']['clause']}
Text   :
{state['text']}

Do these two documents contradict each other on any eligibility criterion such as:
income limit, land holding limit, age, caste, family definition, exclusion categories?

Reply ONLY as valid JSON with no extra text:
{{
  "conflict_detected": true or false,
  "conflict_summary": "One sentence describing the contradiction, or null if none",
  "central_says": "The specific criterion from the central document, or null",
  "state_says": "The specific criterion from the state document, or null"
}}"""

        try:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=400,
                messages=[{"role": "user", "content": prompt}]
            )

            raw = response.content[0].text.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            result = json.loads(raw)

            if result.get("conflict_detected"):
                conflicts.append({
                    "scheme_name":    scheme_name,
                    "conflict_summary": result.get("conflict_summary"),
                    "central_says":   result.get("central_says"),
                    "state_says":     result.get("state_says"),
                    "central_source": f"{central['metadata']['source_pdf']} | {central['metadata']['clause']}",
                    "state_source":   f"{state['metadata']['source_pdf']} | {state['metadata']['clause']}",
                })
                print(f"  CONFLICT FOUND in [{scheme_name}]: {result.get('conflict_summary')}")
            else:
                print(f"  No conflict in [{scheme_name}]")

        except Exception as e:
            print(f"  Conflict check failed for [{scheme_name}]: {e}")
            continue

    if not conflicts:
        print("  No conflicts detected across all schemes.")

    return conflicts