# opencode-starcraft

StarCraft sound effects plugin for [OpenCode](https://opencode.ai). Plays iconic Protoss and Terran voice lines and can show visual desktop notifications when things happen in your coding session.

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

If sound is fully disabled in config, the plugin skips sound pack download.

Audio playback uses `child_process.spawn` with platform-native commands (`afplay` on macOS, `paplay` on Linux) -- no additional dependencies required.

Visual desktop notifications are best-effort and use platform-native tools (`osascript` on macOS, `notify-send` on Linux).

## Events

| OpenCode Event | Sound | Quote |
|---|---|---|
| `session.created` | `scv-ready.wav` | "SCV good to go, sir" |
| `session.idle` | `scv-yes-sir.wav` / `scv-affirmative.wav` | "Yes sir" / "Affirmative" |
| `session.compacted` | `additional-pylons.wav` | **"You must construct additional pylons!"** |
| `session.error` | `not-enough-minerals-*.wav` / `not-enough-vespene-gas.wav` | "Not enough minerals" / "Insufficient vespene gas" |
| `permission.asked` | `scv-whaddya-want.wav` / `scv-im-not-listening.wav` | "Whaddya want?" |

## Configuration

Create `~/.config/opencode/opencode-starcraft.json` to control behavior by level:

```json
{
  "enabled": true,
  "sound": {
    "enabled": true
  },
  "notifications": {
    "enabled": true
  },
  "events": {
    "session.created": { "enabled": true, "sound": true, "visual": true },
    "session.idle": { "enabled": true, "sound": true, "visual": true },
    "session.compacted": { "enabled": true, "sound": true, "visual": true },
    "session.error": { "enabled": true, "sound": true, "visual": true },
    "permission.asked": { "enabled": true, "sound": true, "visual": true }
  }
}
```

Disable all plugin notifications and sounds:

```json
{
  "enabled": false
}
```

Disable all visual notifications (keep sound):

```json
{
  "notifications": {
    "enabled": false
  }
}
```

Disable only one event type:

```json
{
  "events": {
    "session.idle": false
  }
}
```

Disable only visual notifications for one event (keep event + sound enabled):

```json
{
  "events": {
    "permission.asked": {
      "enabled": true,
      "sound": true,
      "visual": false
    }
  }
}
```

## Platform support

| Platform | Audio command | Status |
|---|---|---|
| macOS | `afplay` (built-in) | Tested |
| Linux | `paplay` (PulseAudio) | Should work |

For visual notifications on Linux, install `notify-send` (usually provided by `libnotify-bin` or `libnotify`).

## Credits

- Sound files from StarCraft (Blizzard Entertainment) via [The Sounds Resource](https://www.sounds-resource.com/pc_computer/starcraft/)
- Sounds are downloaded on demand and not distributed with this package
- StarCraft is a trademark of Blizzard Entertainment, Inc.

## License

MIT
