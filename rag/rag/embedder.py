import chromadb
from chromadb.utils import embedding_functions
import hashlib

CHROMA_PATH = r"C:\Users\malik\OneDrive\Desktop\test 2 - Copy (2)\chroma_db"
COLLECTION_NAME = "scheme_chunks"

def get_collection():
    """Get or create the ChromaDB collection."""
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    # Use sentence-transformers for embeddings (free, runs locally)
    embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedder,
        metadata={"hnsw:space": "cosine"}  # cosine similarity
    )
    return collection


def build_chunk_id(chunk: dict) -> str:
    """Create a unique, deterministic ID for each chunk."""
    key = f"{chunk['metadata']['source_pdf']}_{chunk['metadata']['chunk_index']}"
    return hashlib.md5(key.encode()).hexdigest()


def store_chunks(chunks: list, reset: bool = False):
    """Embed and store all chunks into ChromaDB."""
    collection = get_collection()

    if reset:
        # Clear existing data and re-ingest
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        client.delete_collection(COLLECTION_NAME)
        collection = get_collection()
        print("Collection reset.")

    # Check what's already stored
    existing_ids = set(collection.get()["ids"])

    ids, texts, metadatas = [], [], []

    for chunk in chunks:
        chunk_id = build_chunk_id(chunk)
        if chunk_id in existing_ids:
            continue  # skip already-stored chunks

        ids.append(chunk_id)
        texts.append(chunk["text"])
        metadatas.append(chunk["metadata"])

    if not ids:
        print("All chunks already in DB. Nothing new to store.")
        return

    # Store in batches of 100 to avoid memory issues
    batch_size = 100
    for i in range(0, len(ids), batch_size):
        collection.add(
            ids=ids[i:i+batch_size],
            documents=texts[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size]
        )
        print(f"  Stored batch {i//batch_size + 1} ({min(i+batch_size, len(ids))}/{len(ids)} chunks)")

    print(f"\nDone. Total in DB: {collection.count()} chunks")