#!/bin/bash
# Auto-restart Next.js dev server if it dies
cd /home/z/my-project
while true; do
  if ! pgrep -f "next dev" > /dev/null 2>&1; then
    echo "[$(date)] Server not running, starting..."
    rm -rf .next
    NODE_OPTIONS='--max-old-space-size=1024' npx next dev -p 3000 -H 0.0.0.0 > dev.log 2>&1 &
    echo "[$(date)] Started with PID $!"
  fi
  sleep 5
done
