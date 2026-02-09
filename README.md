# opencode-starcraft

StarCraft sound effects plugin for [OpenCode](https://opencode.ai). Plays iconic Protoss and Terran voice lines when things happen in your coding session.

## Install

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-starcraft"]
}
```

Or drop `index.js` into `~/.config/opencode/plugins/`.

Sound files are downloaded automatically on first run from [The Sounds Resource](https://www.sounds-resource.com/pc_computer/starcraft/).

## Events

| Event | Sound |
|---|---|
| Session completes | "Yes sir" / "Affirmative" (SCV) |
| Session starts | "SCV good to go, sir" |
| Context compacted | **"You must construct additional pylons!"** |
| Session error | "Not enough minerals" / "Insufficient vespene gas" |
| Permission asked | "Whaddya want?" / SCV idle chatter |

## Requirements

- **macOS**: Uses `afplay` (built-in)
- **Linux**: Uses `paplay` (PulseAudio) or `aplay` (ALSA)

## Credits

- Sound files from StarCraft (Blizzard Entertainment) via [The Sounds Resource](https://www.sounds-resource.com/pc_computer/starcraft/)
- Sounds are downloaded on demand and not distributed with this package
- StarCraft is a trademark of Blizzard Entertainment, Inc.

## License

MIT
