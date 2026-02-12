# opencode-starcraft

StarCraft sound effects plugin for [OpenCode](https://opencode.ai). Plays iconic Protoss and Terran voice lines when things happen in your coding session.

It can also generate a session digest and run a custom command on `session.idle` and/or process exit (`Ctrl+C`, `SIGTERM`).

## Install

### From npm (recommended)

Add `opencode-starcraft` to the `plugin` array in your OpenCode config file.

The config file is at `~/.config/opencode/opencode.json` (global) or `opencode.json` (project-level).

```json
{
  "plugin": ["opencode-starcraft"]
}
```

OpenCode installs npm plugins automatically at startup. No other steps needed.

### From source

Clone this repo and copy `index.js` into your OpenCode plugins directory:

```bash
git clone https://github.com/spartandingo/opencode-starcraft.git
cp opencode-starcraft/index.js ~/.config/opencode/plugins/starcraft-sounds.js
```

## How it works

Sound files are downloaded automatically on first run from [The Sounds Resource](https://www.sounds-resource.com/pc_computer/starcraft/) and cached in `~/.config/opencode/sounds/starcraft/`. No sound files are distributed with this package.

Audio playback uses `child_process.spawn` with platform-native commands (`afplay` on macOS, `paplay` on Linux) -- no additional dependencies required.

## Session digest hook

Create `~/.config/opencode/opencode-starcraft.json` to enable digest generation and command hooks:

```json
{
  "digest": {
    "enabled": true,
    "onIdle": true,
    "onExit": true,
    "path": "~/.config/opencode/digests/opencode-starcraft-last.json",
    "command": "opencode-starcraft-digest"
  }
}
```

When enabled, the plugin writes a JSON digest with event counters and recent context. If `digest.command` is set, the command runs after digest generation with `OPENCODE_STARCRAFT_DIGEST_PATH` in the environment.

You can also run the digest command manually:

```bash
opencode-starcraft-digest
```

Or pass a custom digest path:

```bash
opencode-starcraft-digest /path/to/digest.json
```

## Events

| OpenCode Event | Sound | Quote |
|---|---|---|
| `session.created` | `scv-ready.wav` | "SCV good to go, sir" |
| `session.idle` | `scv-yes-sir.wav` / `scv-affirmative.wav` | "Yes sir" / "Affirmative" |
| `session.compacted` | `additional-pylons.wav` | **"You must construct additional pylons!"** |
| `session.error` | `not-enough-minerals-*.wav` / `not-enough-vespene-gas.wav` | "Not enough minerals" / "Insufficient vespene gas" |
| `permission.asked` | `scv-whaddya-want.wav` / `scv-im-not-listening.wav` | "Whaddya want?" |

## Platform support

| Platform | Audio command | Status |
|---|---|---|
| macOS | `afplay` (built-in) | Tested |
| Linux | `paplay` (PulseAudio) | Should work |

## Credits

- Sound files from StarCraft (Blizzard Entertainment) via [The Sounds Resource](https://www.sounds-resource.com/pc_computer/starcraft/)
- Sounds are downloaded on demand and not distributed with this package
- StarCraft is a trademark of Blizzard Entertainment, Inc.

## License

MIT
