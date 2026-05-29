#!/usr/bin/env node

const { execSync } = require('node:child_process')
const { readFileSync } = require('node:fs')

const secretPatterns = [
  {
    name: 'Supabase secret key (sb_secret_)',
    regex: /sb_secret_[A-Za-z0-9_-]{20,}/g
  },
  {
    name: 'JWT-like token',
    regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g
  }
]

const ignoreFiles = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock'
])

function getTrackedFiles() {
  const output = execSync('git ls-files', { encoding: 'utf8' })
  return output
    .split('\n')
    .map(file => file.trim())
    .filter(Boolean)
    .filter(file => !ignoreFiles.has(file))
}

function scanFile(filePath) {
  const contents = readFileSync(filePath, 'utf8')
  const lines = contents.split('\n')
  const findings = []

  lines.forEach((line, index) => {
    for (const pattern of secretPatterns) {
      pattern.regex.lastIndex = 0
      if (pattern.regex.test(line)) {
        findings.push({
          filePath,
          lineNumber: index + 1,
          pattern: pattern.name
        })
      }
    }
  })

  return findings
}

const files = getTrackedFiles()
const findings = []

for (const filePath of files) {
  try {
    findings.push(...scanFile(filePath))
  } catch {
    // Skip unreadable/binary files
  }
}

if (findings.length > 0) {
  console.error('❌ Secret scan failed. Potential secrets found:')
  for (const finding of findings) {
    console.error(`- ${finding.filePath}:${finding.lineNumber} (${finding.pattern})`)
  }
  process.exit(1)
}

console.log(`✅ Secret scan passed (${files.length} tracked files scanned).`)
