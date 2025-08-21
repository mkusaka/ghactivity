#!/usr/bin/env node

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => raw += chunk)
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw)
    const cmd = input.tool_input?.command ?? ''

    // Check first part of the command
    const cmdParts = cmd.trim().split(/\s+/)
    const firstCmd = cmdParts[0].split('/').pop()
    
    if (/^(npm|yarn|npx)$/.test(firstCmd)) {
      console.error('Use pnpm instead of npm/yarn/npx')
      process.exit(2)
    }
    process.exit(0)
  } catch (e) {
    console.error(`check-pm.js: stdin JSON parse error ${e.message}`)
    process.exit(0)
  }
})
