#!/bin/bash
cd /home/z/my-project
NODE_OPTIONS='--max-old-space-size=2048' node node_modules/.bin/next dev -p 3000 -H 0.0.0.0 --turbopack >> dev.log 2>&1
