#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Launch server in background if not already running
if ! pgrep -f "physics_wonderland/server.py" > /dev/null; then
    python3 "$DIR/server.py" &
    sleep 1
else
    # Server is already running, just open Google Chrome directly
    open -a "Google Chrome" "http://localhost:8765/index.html"
fi
