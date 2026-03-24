# Lazy imports — only load when actually called, not at startup

def get_ingestor():
    from rag.ingestor import ingest_all_pdfs
    return ingest_all_pdfs

def get_embedder():
    from rag.embedder import store_chunks, get_collection
    return store_chunks, get_collection

def get_retriever():
    from rag.retriever import retrieve
    return retrieve

def get_conflict():
    from rag.conflict import detect_conflicts
    return detect_conflicts

def get_synthesizer():
    from rag.synthesizer import synthesize
    return synthesize

def get_orchestrator():
    from rag.orchestrator import load_citizen_profile
    return load_citizen_profile