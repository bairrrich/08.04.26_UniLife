// This is a keep-alive wrapper for the dev server
// Run: cd mini-services/dev-server && bun --hot run start.ts
import { execSync, spawn } from 'child_process'

const server = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
  cwd: '/home/z/my-project',
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
})

server.stdout?.on('data', (d) => process.stdout.write(d))
server.stderr?.on('data', (d) => process.stderr.write(d))
server.on('exit', () => {
  console.log('Dev server exited, restarting...')
  setTimeout(() => process.exit(1), 3000)
})

// Keep alive
setInterval(() => {}, 10000)
