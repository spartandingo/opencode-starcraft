#!/usr/bin/env node

import { readFileSync } from "fs"
import { join } from "path"
import { homedir } from "os"

const defaultPath = join(
  homedir(),
  ".config",
  "opencode",
  "digests",
  "opencode-starcraft-last.json"
)

const inputPath = process.argv[2] || process.env.OPENCODE_STARCRAFT_DIGEST_PATH || defaultPath

try {
  const raw = readFileSync(inputPath, "utf-8")
  const digest = JSON.parse(raw)

  process.stdout.write(`Digest file: ${inputPath}\n`)
  process.stdout.write(`Started: ${digest.startedAt}\n`)
  process.stdout.write(`Ended: ${digest.endedAt}\n`)
  process.stdout.write(`Reason: ${digest.reason}\n`)
  process.stdout.write("Events:\n")

  for (const [eventType, count] of Object.entries(digest.eventCounts || {})) {
    process.stdout.write(`  - ${eventType}: ${count}\n`)
  }

  if (digest.lastError) {
    process.stdout.write(`Last error: ${digest.lastError}\n`)
  }

  if (digest.lastPermission?.permission) {
    process.stdout.write(`Last permission: ${digest.lastPermission.permission}\n`)
  }

  if (digest.lastQuestion?.question) {
    process.stdout.write(`Last question: ${digest.lastQuestion.question}\n`)
  }
} catch (err) {
  process.stderr.write(`Failed to read digest at ${inputPath}: ${err.message}\n`)
  process.exit(1)
}
