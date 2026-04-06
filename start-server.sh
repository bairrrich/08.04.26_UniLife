#!/bin/bash
cd /home/z/my-project
rm -rf .next 2>/dev/null
export NODE_OPTIONS="--max-old-space-size=2048"
exec npx next dev -p 3000 -H 0.0.0.0 --turbopack
