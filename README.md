# toy

Minimalistic TUI text editor.

- [Installation](#installation)
  - [Homebrew (macOS only)](#homebrew-macos-only)
- [Features](#features)
- [Supported terminal emulators](#supported-terminal-emulators)
- [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Function](#function)
  - [Navigate](#navigate)
  - [Select](#select)
  - [Edit](#edit)
- [Roadmap](#roadmap)
- [License](#license)

## Installation

### Homebrew (macOS only)

Install from a tap (Third-Party Repository):

```bash
brew install eu-ge-ne/tap/toy
```

## Features

- Built with Deno and TypeScript (has zero third-party dependencies)
- Opens large files (tested on gigabyte-sized files)
- Properly handles Unicode grapheme clusters
- Leverages
  [Synchronized Output](https://gist.github.com/christianparpart/d8a62cc1ab659194337d73e399004036)
  extension for fast rendering
- Supports the
  [Kitty keyboard protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol)
- Integrates with system clipboard via OSC52
- Utilizes the 256-color terminal palette
- Renders invisible characters (e.g., spaces, tabs)
- Renders long lines via scroll or wrap
- Has Zen mode (enabled by default, can be turned off)

## Supported terminal emulators

- kitty
- Ghostty
- VSCode terminal

## Keyboard Shortcuts

### Function

- `Esc` -- Center the cursor or selection in the visible area
- `F2` -- Save
- `F5` -- Toggle invisible characters
- `F6` -- Toggle line wrapping
- `F9` -- Toggle debug panel
- `F10` -- Exit
- `F11` -- Toggle Zen mode

### Navigate

- `Left`, `Right`, `Up`, `Down` -- Move cursor
- `Home` -- Move cursor to beginning of current line (`Fn+Left`, `⌘+Left`)
- `End` -- Move cursor to end of current line (`Fn+Right`, `⌘+Right`)
- `Page Up` -- Move cursor up a frame (`Fn+Up`)
- `Page Down` -- Move cursor down a frame (`Fn+Down`)
- `⌘+Up` -- Move cursor to the top of the text
- `⌘+Down` -- Move cursor to the bottom of the text

### Select

- `⇧+Left` -- Extend text selection one character to the left
- `⇧+Right` -- Extend text selection one character to the right
- `⇧+Up` -- Extend text selection to the nearest character at the same
  horizontal location on the line above
- `⇧+Down` -- Extend text selection to the nearest character at the same
  horizontal location on the line below
- `⇧+Home`, `⇧+Fn+Left`, `⇧+⌘+Left` -- Select the text between the cursor and
  the beginning of the current line
- `⇧+End`, `⇧+Fn+Right`, `⇧+⌘+Right` -- Select the text between the cursor and
  the end of the current line
- `⇧+Page Up`, `⇧+Fn+Up` -- Select a frame of text above the cursor
- `⇧+Page Down`, `⇧+Fn+Down` -- Select a frame of text below the cursor
- `⇧+⌘+Up` -- Select the text between the cursor and the beginning of the text
- `⇧+⌘+Down` -- Select the text between the cursor and the end of the text
- `⌃+A`, `⌘+A` -- Select all text

### Edit

- `⌃+Z`, `⌘+Z` -- Undo
- `⌃+Y`, `⌘+Y` -- Redo
- `⌃+C`, `⌘+C` -- Copy selected text
- ️`⌃+X`, `⌘+X` -- Cut selected text
- `⌃+V`, `⌘+V` -- Paste text at cursor
- `Delete` -- Delete the character to the left of the cursor
- `Fn+Delete` -- Delete the character under the cursor

## Roadmap

- `⌃+F` -- Find
- `F3` -- Find next
- `⇧+F3` -- Find previous

## License

[MIT](https://choosealicense.com/licenses/mit)
