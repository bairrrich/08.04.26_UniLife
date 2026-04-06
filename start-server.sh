#!/bin/bash
cd /home/z/my-project
while true; do
  rm -rf .next
  NODE_OPTIONS="--max-old-space-size=384" npx next dev -p 3000 -H 0.0.0.0 2>&1
  echo "Server crashed, restarting in 3s..."
  sleep 3
done
