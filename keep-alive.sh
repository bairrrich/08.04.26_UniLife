#!/bin/bash
# Keep-alive for Next.js dev server in sandboxed environment
# Prevents idle process kill by sending periodic requests

cd /home/z/my-project

cleanup() {
  kill $SERVER_PID $PING_PID 2>/dev/null
  wait 2>/dev/null
  exit 0
}
trap cleanup EXIT INT TERM

# Start Next.js dev server
npx next dev --turbopack -p 3000 >> dev.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
for i in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000/ 2>/dev/null; then
    break
  fi
  sleep 1
done
echo "[$(date +%H:%M:%S)] Server ready (PID: $SERVER_PID)"

# Keep-alive: ping every 15 seconds to prevent idle kill
(
  while true; do
    sleep 15
    curl -s -o /dev/null http://localhost:3000/ 2>/dev/null || {
      echo "[$(date +%H:%M:%S)] Server died, exiting keep-alive"
      exit 1
    }
  done
) &
PING_PID=$!

# Wait for server process
wait $SERVER_PID 2>/dev/null
echo "[$(date +%H:%M:%S)] Server exited, cleaning up..."
kill $PING_PID 2>/dev/null
