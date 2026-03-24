import hashlib
import chromadb
from chromadb.utils import embedding_functions
from config import CHROMA_PATH, COLLECTION_NAME


def get_collection():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    embedder = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedder,
        metadata={"hnsw:space": "cosine"}
    )
    return collection


def build_chunk_id(chunk: dict) -> str:
    key = f"{chunk['metadata']['source_pdf']}_{chunk['metadata']['chunk_index']}"
    return hashlib.md5(key.encode()).hexdigest()


def store_chunks(chunks: list, reset: bool = False):
    collection = get_collection()

    if reset:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        client.delete_collection(COLLECTION_NAME)
        collection = get_collection()
        print("Collection reset.")

    existing_ids = set(collection.get()["ids"])
    ids, texts, metadatas = [], [], []

    for chunk in chunks:
        chunk_id = build_chunk_id(chunk)
        if chunk_id in existing_ids:
            continue
        ids.append(chunk_id)
        texts.append(chunk["text"])
        metadatas.append(chunk["metadata"])

    if not ids:
        print("All chunks already in DB. Nothing new to store.")
        return

    batch_size = 100
    for i in range(0, len(ids), batch_size):
        collection.add(
            ids=ids[i:i+batch_size],
            documents=texts[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size]
        )
        print(f"  Stored batch {i//batch_size + 1} "
              f"({min(i+batch_size, len(ids))}/{len(ids)} chunks)")

    print(f"\nDone. Total in DB: {collection.count()} chunks")
