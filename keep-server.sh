#!/bin/bash
cd /home/z/my-project
rm -rf .next 2>/dev/null
export NODE_OPTIONS="--max-old-space-size=2048"
while true; do
  echo "Starting server at $(date)..."
  npx next dev -p 3000 -H 0.0.0.0 --turbopack 2>&1 &
  SERVER_PID=$!
  echo "Server PID: $SERVER_PID"
  
  # Wait for server to die
  wait $SERVER_PID
  echo "Server died at $(date), restarting in 2s..."
  sleep 2
done
