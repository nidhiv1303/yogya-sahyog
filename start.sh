#!/usr/bin/env bash
# start.sh — starts FastAPI (port 8000) + Node proxy (port 3000) together

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Sahyog Backend Startup ==="
echo "  Project root: $ROOT"

# ── Activate conda env ─────────────────────────────────────
source /opt/miniconda3/etc/profile.d/conda.sh
conda activate personal

# ── FastAPI (Python) ────────────────────────────────────────
echo "  Starting FastAPI on :8000 ..."
cd "$ROOT"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload 2>&1 &
FASTAPI_PID=$!
echo "  FastAPI PID: $FASTAPI_PID"

# Wait up to 10s for FastAPI to become ready
for i in $(seq 1 10); do
    sleep 1
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo "  FastAPI ready (took ${i}s)"
        break
    fi
    if ! kill -0 "$FASTAPI_PID" 2>/dev/null; then
        echo ""
        echo "  ERROR: FastAPI process died. Check uvicorn output above."
        exit 1
    fi
    echo "  Waiting for FastAPI... (${i}/10)"
done

# ── Node proxy ─────────────────────────────────────────────
echo "  Starting Node proxy on :3000 ..."
cd "$ROOT/sahyog-node"
node index.js &
NODE_PID=$!
echo "  Node PID: $NODE_PID"

echo ""
echo "  FastAPI  →  http://localhost:8000"
echo "  Node     →  http://localhost:3000"
echo ""
echo "  (Ctrl+C to stop both services)"

# ── Clean shutdown ──────────────────────────────────────────
trap "echo ''; echo 'Shutting down...'; kill $FASTAPI_PID $NODE_PID 2>/dev/null; exit 0" INT TERM

wait $FASTAPI_PID $NODE_PID
