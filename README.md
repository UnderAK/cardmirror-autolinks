# CardMirror Auto Hyperlinks

A CardMirror plugin that automatically converts URLs into clickable hyperlinks.

## Features

- 🔗 Automatically converts typed URLs into hyperlinks
- 📋 Automatically detects pasted URLs
- 🌐 Supports `http://` and `https://` URLs
- 📄 Includes a **Link All URLs** command for existing documents
- ↩️ Works with CardMirror's normal undo/redo behavior
- 🧩 Runs entirely as a CardMirror plugin

## Example

Type:

https://github.com/ant981228/cardmirror

and the URL will automatically become a clickable hyperlink.

## Link All URLs

Already have a document containing plain-text URLs?

Use:

**Command Palette → Link All URLs**

This scans the selected/current document and converts detected URLs into clickable hyperlinks.

## Installation

1. Download the latest release.
2. Extract the plugin files.
3. Open CardMirror Desktop.
4. Go to **Settings → Plugins**.
5. Enable plugins.
6. Choose **Load plugin from file...**
7. Select `plugin.js`.
8. Restart CardMirror if necessary.

## Requirements

- CardMirror Desktop
- CardMirror plugin support enabled

## Compatibility

This plugin uses CardMirror's plugin API.

The plugin is not affiliated with or officially endorsed by CardMirror.

## License

MIT
