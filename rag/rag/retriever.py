import chromadb
from chromadb.utils import embedding_functions

CHROMA_PATH = r"C:\Users\malik\OneDrive\Desktop\test 2 - Copy (2)\chroma_db"
COLLECTION_NAME = "scheme_chunks"


def get_collection():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    return client.get_collection(
        name=COLLECTION_NAME,
        embedding_function=embedder
    )


def build_queries(profile: dict) -> list:
    state        = profile.get("state", "")
    occupation   = profile.get("occupation", "")
    income       = profile.get("annual_income_inr", 0)
    land         = profile.get("land_acres", 0)
    category     = profile.get("caste_category", "")
    needs        = profile.get("need_categories", [])
    age          = profile.get("age", 0)
    bpl          = profile.get("bpl_card", False)
    disability   = profile.get("disability", False)
    crop         = profile.get("crop_type", "")
    family_size  = profile.get("family_size", 0)
    gender       = profile.get("gender", "")
    employment   = profile.get("employment_type", "")

    queries = []

    # ── Income-specific query — uses actual income number ──
    queries.append({
        "text": f"eligibility income below {income} annual rupees scheme benefit India",
        "filter": {"level": {"$eq": "central"}},
        "label": "income_specific",
        "weight": 1.2
    })

    # ── Occupation + land specific ──
    if occupation and land > 0:
        queries.append({
            "text": f"{occupation} land {land} acres hectare eligibility welfare scheme",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": "occupation_land",
            "weight": 1.1
        })
    elif occupation:
        queries.append({
            "text": f"{occupation} employment scheme eligibility benefit India {state}",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": "occupation_only",
            "weight": 1.0
        })

    # ── State-specific query ──
    if state:
        queries.append({
            "text": f"{state} government scheme {occupation} eligibility {' '.join(needs)}",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": "state_specific",
            "weight": 1.1
        })

    # ── Need category queries — one per need ──
    for need in needs:
        queries.append({
            "text": f"{need} scheme eligibility criteria benefit India {state} {occupation}",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": f"need_{need}",
            "weight": 1.0
        })

    # ── Caste/category specific ──
    if category and category.lower() not in ("general", ""):
        queries.append({
            "text": f"{category} caste reserved category scheme welfare benefit eligibility",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": "caste_specific",
            "weight": 1.0
        })

    # ── BPL specific ──
    if bpl:
        queries.append({
            "text": f"below poverty line BPL card scheme eligibility ration card benefit",
            "filter": {},
            "label": "bpl_specific",
            "weight": 1.1
        })

    # ── Disability specific ──
    if disability:
        queries.append({
            "text": f"disability divyang scheme eligibility benefit pension India",
            "filter": {},
            "label": "disability_specific",
            "weight": 1.1
        })

    # ── Gender specific ──
    if gender and gender.lower() == "female":
        queries.append({
            "text": f"women female scheme eligibility benefit India {state} {occupation}",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": "gender_specific",
            "weight": 1.0
        })

    # ── Age specific ──
    if age and age >= 60:
        queries.append({
            "text": f"senior citizen old age pension scheme eligibility {age} years",
            "filter": {},
            "label": "senior_citizen",
            "weight": 1.1
        })

    # ── Crop specific ──
    if crop:
        queries.append({
            "text": f"{crop} crop farmer scheme insurance subsidy eligibility India",
            "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
            "label": "crop_specific",
            "weight": 1.0
        })

    # ── Application process ──
    queries.append({
        "text": f"documents required how to apply {occupation} scheme steps procedure",
        "filter": {"$or": [{"state": {"$eq": state}}, {"state": {"$eq": "all"}}]},
        "label": "application_process",
        "weight": 0.9
    })

    return queries


def retrieve(profile: dict, top_k_per_query: int = 6, final_top_k: int = 15) -> list:
    collection    = get_collection()
    query_list    = build_queries(profile)
    citizen_state = profile.get("state", "")
    citizen_income = profile.get("annual_income_inr", 0)

    all_results = {}

    for query in query_list:
        try:
            kwargs = {
                "query_texts": [query["text"]],
                "n_results":   top_k_per_query,
                "include":     ["documents", "metadatas", "distances"]
            }
            if query["filter"]:
                kwargs["where"] = query["filter"]

            results = collection.query(**kwargs)

            for i, doc_id in enumerate(results["ids"][0]):
                distance   = results["distances"][0][i]
                similarity = (1 - distance) * query["weight"]
                metadata   = results["metadatas"][0][i]

                # ── State filter — skip other states ──
                chunk_state = metadata.get("state", "all")
                if chunk_state not in ("all", citizen_state, ""):
                    continue

                # ── Score threshold ──
                if similarity < 0.45:
                    continue

                if doc_id not in all_results or all_results[doc_id]["score"] < similarity:
                    all_results[doc_id] = {
                        "id":            doc_id,
                        "text":          results["documents"][0][i],
                        "metadata":      metadata,
                        "score":         similarity,
                        "matched_query": query["label"]
                    }

        except Exception as e:
            print(f"  Query '{query['label']}' failed: {e}")
            continue

    # ── Keep best chunk per scheme ──
    best_per_scheme = {}
    for chunk in all_results.values():
        scheme = chunk["metadata"].get("scheme_name", "unknown")
        if scheme not in best_per_scheme or chunk["score"] > best_per_scheme[scheme]["score"]:
            best_per_scheme[scheme] = chunk

    # ── Re-rank with citizen-aware boosts ──
    ranked = list(best_per_scheme.values())
    for r in ranked:
        meta = r["metadata"]
        if meta.get("state") == citizen_state:
            r["score"] += 0.08
        if meta.get("level") == "central":
            r["score"] += 0.02

    ranked.sort(key=lambda x: x["score"], reverse=True)
    top = ranked[:final_top_k]

    print(f"  Retrieved {len(top)} unique schemes via {len(query_list)} queries")
    return top