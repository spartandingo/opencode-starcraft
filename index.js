// opencode-starcraft
// StarCraft sound effects plugin for OpenCode.
// Plays iconic Protoss and Terran voice lines on session events.
//
// Sounds are downloaded on first run from The Sounds Resource
// (sounds.spriters-resource.com). StarCraft is (c) Blizzard Entertainment.
// Sounds are used under fair use for personal/fan use only.

import { join } from "path"
import { homedir } from "os"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs"
import { spawn } from "child_process"

const SOUNDS_DIR = join(homedir(), ".config", "opencode", "sounds", "starcraft")
const CONFIG_PATH = join(homedir(), ".config", "opencode", "opencode-starcraft.json")

// Download URLs from The Sounds Resource
const SOUND_PACKS = {
  "protoss-advisor": {
    url: "https://sounds.spriters-resource.com/media/assets/416/419544.zip",
    // Maps internal wav filenames -> our readable names
    files: {
      "advisor/paderr02.wav": "additional-pylons.wav",
      "advisor/paderr00.wav": "not-enough-minerals-protoss.wav",
      "advisor/paderr01.wav": "not-enough-vespene-gas.wav",
    },
  },
  "terran-advisor": {
    url: "https://sounds.spriters-resource.com/media/assets/416/419574.zip",
    files: {
      "advisor/taderr00.wav": "not-enough-minerals-terran.wav",
      "advisor/taderr04.wav": "nuclear-launch-detected.wav",
      "advisor/tadupd07.wav": "your-base-is-under-attack.wav",
    },
  },
  scv: {
    url: "https://sounds.spriters-resource.com/media/assets/416/419592.zip",
    files: {
      "scv/tscrdy00.wav": "scv-ready.wav",
      "scv/tscyes00.wav": "scv-yes-sir.wav",
      "scv/tscyes02.wav": "scv-affirmative.wav",
      "scv/tscwht00.wav": "scv-whaddya-want.wav",
      "scv/tscwht01.wav": "scv-im-not-listening.wav",
      "scv/tscerr00.wav": "scv-cant-do-that.wav",
      "scv/tscdth00.wav": "scv-death.wav",
      "scv/tscpss00.wav": "scv-pissed-0.wav",
    },
  },
}

// All expected sound files
const ALL_SOUNDS = Object.values(SOUND_PACKS).flatMap((pack) =>
  Object.values(pack.files)
)

// Sound mapping - each event maps to an array of possible sound files (random selection)
const EVENT_SOUNDS = {
  // Session completed / idle - SCV acknowledgment lines
  "session.idle": ["scv-yes-sir.wav", "scv-affirmative.wav"],
  // Session created - SCV ready
  "session.created": ["scv-ready.wav"],
  // Compaction - "You must construct additional pylons!"
  "session.compacted": ["additional-pylons.wav"],
  // Error - resource shortage lines
  "session.error": [
    "not-enough-minerals-protoss.wav",
    "not-enough-minerals-terran.wav",
    "not-enough-vespene-gas.wav",
  ],
  // Permission asked - awaiting orders
  "permission.asked": ["scv-whaddya-want.wav", "scv-im-not-listening.wav"],
}

const SOUND_PROFILES = {
  classic: EVENT_SOUNDS,
  "protoss-only": {
    "session.idle": ["additional-pylons.wav"],
    "session.created": ["additional-pylons.wav"],
    "session.compacted": ["additional-pylons.wav"],
    "session.error": ["not-enough-minerals-protoss.wav", "not-enough-vespene-gas.wav"],
    "permission.asked": ["additional-pylons.wav"],
  },
  "terran-only": {
    "session.idle": ["scv-affirmative.wav"],
    "session.created": ["scv-ready.wav"],
    "session.compacted": ["your-base-is-under-attack.wav"],
    "session.error": ["not-enough-minerals-terran.wav", "nuclear-launch-detected.wav"],
    "permission.asked": ["scv-yes-sir.wav"],
  },
  "scv-only": {
    "session.idle": ["scv-yes-sir.wav", "scv-affirmative.wav"],
    "session.created": ["scv-ready.wav"],
    "session.compacted": ["scv-cant-do-that.wav"],
    "session.error": ["scv-cant-do-that.wav"],
    "permission.asked": ["scv-whaddya-want.wav", "scv-im-not-listening.wav"],
  },
  minimal: {
    "session.error": ["not-enough-minerals-protoss.wav"],
    "permission.asked": ["scv-whaddya-want.wav"],
  },
  dramatic: {
    "session.idle": ["your-base-is-under-attack.wav"],
    "session.created": ["nuclear-launch-detected.wav"],
    "session.compacted": ["additional-pylons.wav"],
    "session.error": ["nuclear-launch-detected.wav", "your-base-is-under-attack.wav"],
    "permission.asked": ["scv-im-not-listening.wav"],
  },
  calm: {
    "session.idle": ["scv-yes-sir.wav"],
    "session.created": ["scv-ready.wav"],
    "session.compacted": ["scv-affirmative.wav"],
    "session.error": ["not-enough-vespene-gas.wav"],
    "permission.asked": ["scv-whaddya-want.wav"],
  },
  strict: {
    "session.error": ["not-enough-minerals-terran.wav"],
    "permission.asked": ["scv-cant-do-that.wav"],
  },
  retro: {
    "session.idle": ["scv-affirmative.wav"],
    "session.created": ["scv-ready.wav"],
    "session.compacted": ["additional-pylons.wav"],
    "session.error": ["not-enough-minerals-protoss.wav"],
    "permission.asked": ["scv-whaddya-want.wav"],
  },
  chaos: {
    "session.idle": ["scv-yes-sir.wav", "your-base-is-under-attack.wav", "additional-pylons.wav"],
    "session.created": ["scv-ready.wav", "nuclear-launch-detected.wav"],
    "session.compacted": ["additional-pylons.wav", "scv-cant-do-that.wav"],
    "session.error": [
      "nuclear-launch-detected.wav",
      "your-base-is-under-attack.wav",
      "not-enough-minerals-protoss.wav",
      "not-enough-minerals-terran.wav",
    ],
    "permission.asked": ["scv-im-not-listening.wav", "scv-whaddya-want.wav", "scv-pissed-0.wav"],
  },
}

const DEFAULT_CONFIG = {
  sound: {
    enabled: true,
    profile: "classic",
  },
}

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) return DEFAULT_CONFIG

  try {
    const parsed = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
    return {
      sound: {
        enabled: parsed?.sound?.enabled ?? DEFAULT_CONFIG.sound.enabled,
        profile: parsed?.sound?.profile ?? DEFAULT_CONFIG.sound.profile,
      },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function resolveProfile(profile) {
  if (!profile || typeof profile !== "string") return "classic"
  if (SOUND_PROFILES[profile]) return profile
  return "classic"
}

function getEventSounds(profile, eventType) {
  const eventSounds = SOUND_PROFILES[profile]?.[eventType]
  if (!eventSounds || eventSounds.length === 0) return []
  return eventSounds
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function playSound(file) {
  if (!existsSync(file)) return

  const cmd = process.platform === "darwin" ? "afplay" : "paplay"
  const child = spawn(cmd, [file], {
    detached: true,
    stdio: "ignore",
  })
  child.unref()
}

function soundsExist() {
  if (!existsSync(SOUNDS_DIR)) return false
  try {
    const files = readdirSync(SOUNDS_DIR)
    return ALL_SOUNDS.every((s) => files.includes(s))
  } catch {
    return false
  }
}

async function downloadSounds(log) {
  log("Downloading StarCraft sounds...")
  mkdirSync(SOUNDS_DIR, { recursive: true })

  const { default: JSZip } = await import("jszip")

  for (const [name, pack] of Object.entries(SOUND_PACKS)) {
    log(`  Fetching ${name}...`)
    try {
      const res = await fetch(pack.url)
      if (!res.ok) {
        log(`  Failed to download ${name}: ${res.status}`)
        continue
      }

      const buffer = await res.arrayBuffer()
      const zip = await JSZip.loadAsync(buffer)

      for (const [zipPath, outName] of Object.entries(pack.files)) {
        const entry = zip.file(zipPath)
        if (entry) {
          const data = await entry.async("nodebuffer")
          writeFileSync(join(SOUNDS_DIR, outName), data)
        } else {
          log(`  Warning: ${zipPath} not found in ${name} archive`)
        }
      }
    } catch (err) {
      log(`  Error processing ${name}: ${err.message}`)
    }
  }

  log("StarCraft sounds ready!")
}

export const StarcraftSoundsPlugin = async ({ client }) => {
  const config = loadConfig()
  const profile = resolveProfile(config.sound.profile)

  const log = async (msg) => {
    try {
      await client.app.log({
        body: {
          service: "opencode-starcraft",
          level: "info",
          message: msg,
        },
      })
    } catch {
      // Logging is best-effort
    }
  }

  // Download sounds on first run
  if (!soundsExist()) {
    try {
      await downloadSounds((msg) => log(msg))
    } catch (err) {
      await log(`Failed to download sounds: ${err.message}`)
    }
  }

  return {
    event: async ({ event }) => {
      if (!config.sound.enabled) return

      const sounds = getEventSounds(profile, event.type)
      if (!sounds || sounds.length === 0) return

      playSound(join(SOUNDS_DIR, pick(sounds)))
    },
  }
}
