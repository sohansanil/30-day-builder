#!/bin/bash
echo "Starting FoldDeck UI Server at http://localhost:8000..."
python3 -m http.server 8000 > /dev/null 2>&1 &
HTTP_PID=$!

echo "Starting FoldDeck WebSocket Backend..."
uv run --with websockets --with pybooklid python server.py

# When the websocket server is stopped with Ctrl+C, kill the HTTP server too
kill $HTTP_PID
