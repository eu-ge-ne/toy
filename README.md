# toy

Minimalistic TUI text editor.

- [Installation](#installation)
  - [Homebrew (macOS only)](#homebrew-macos-only)
- [Features](#features)
- [Supported terminal emulators](#supported-terminal-emulators)
- [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Navigate](#navigate)
  - [Select](#select)
  - [Edit](#edit)
  - [Other](#other)
  - [Roadmap](#roadmap)
- [License](#license)

## Installation

### Homebrew (macOS only)

Install from a tap (Third-Party Repository):

```bash
brew install eu-ge-ne/tap/toy
```

## Features

- Written in Deno/TypeScript
- No 3d-party dependencies
- 256 colors
- Accurate handling of Unicode grapheme clusters
  ([see](https://mitchellh.com/writing/grapheme-clusters-in-terminals))
- [Kitty keyboard protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol)
  support
- Copy to system clipboard (OSC52)
- Line wrapping

## Supported terminal emulators

- kitty
- Ghostty
- VSCode terminal

## Keyboard Shortcuts

### Navigate

- `Left`, `Right`, `Up`, `Down` -- Move cursor
- `Home`, `Fn+Left`, `⌘+Left` -- Move cursor to beginning of current line
- `End`, `Fn+Right`, `⌘+Right` -- Move cursor to end of current line
- `Page Up`, `Fn+Up` -- Move cursor up a frame
- `Page Down`, `Fn+Down` -- Move cursor down a frame
- `⌘+Up` -- Move cursor to top of the text
- `⌘+Down` -- Move cursor to bottom of the text
- `Esc` -- Center the cursor or selection in the visible area

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

### Other

- `F2` -- Save
- `F5` -- Toggle invisible characters
- `F6` -- Toggle word wrapping
- `F9` -- Toggle debug panel
- `F10` -- Exit

### Roadmap

- `⌃+F` -- Find
- `F3` -- Find next
- `⇧+F3` -- Find previous

## License

[MIT](https://choosealicense.com/licenses/mit)
