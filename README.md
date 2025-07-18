# toy

Minimalistic TUI text editor.

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

## Changelog

### v0.0.10

- Improve invisible characters colors
- Improve line index colors

### v0.0.9

- Fix scrolling
- `F5` -- Toggle invisible characters

### v0.0.8

- Accurate handling of Unicode grapheme clusters
  ([see](https://mitchellh.com/writing/grapheme-clusters-in-terminals))

### v0.0.7

- `F6` -- Toggle word wrapping
- `⌃+C` -- Copy selected text
- `F10` -- Exit
- `Delete` -- Delete the character to the left of the cursor
- `Fn+Delete` -- Delete the character under the cursor

### v0.0.6

- Fix parsing `Esc`, `F2` keys in terminals which do not support Kitty keyboard
  protocol
- Fix deleting text selection

### v0.0.5

- Copy to system clipboard (OSC52)

### v0.0.4

- `⌃+A`, `⌘+A`
- `⇧+Home`, `⇧+Fn+Left`, `⇧+⌘+Left`
- `⇧+End`, `⇧+Fn+Right`, `⇧+⌘+Right`
- `⇧+⌘+Up`
- `⇧+⌘+Down`
- `⇧+Page Up`, `⇧+Fn+Up`
- `⇧+Page Down`, `⇧+Fn+Down`

### v0.0.3

- Fix text insertion
- `⌘+Z`
- `⌘+Y`
- `⌃+C`, `⌘+C`
- ️`⌃+X`, `⌘+X`
- `⌃+V`, `⌘+V`

### v0.0.2

- `⌘+Up`, `⌘+Down`, `⌘+Left`, `⌘+Right`
- `⇧+Up`, `⇧+Down`, `⇧+Left`, `⇧+Right`

### v0.0.1

- Initial release
