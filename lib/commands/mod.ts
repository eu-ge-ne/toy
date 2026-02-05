import { Key } from "@lib/kitty";

export interface Command<T = void> {
  id: string;
  description: string;
  keys: Key[];
  data: T;
}

export const Copy: Command = {
  id: "Copy",
  description: "Edit: Copy",
  keys: [
    Key.create({ name: "c", ctrl: true }),
    Key.create({ name: "c", super: true }),
  ],
  data: undefined,
};

export const Cut: Command = {
  id: "Cut",
  description: "Edit: Cut",
  keys: [
    Key.create({ name: "x", ctrl: true }),
    Key.create({ name: "x", super: true }),
  ],
  data: undefined,
};

export const Debug: Command = {
  id: "Debug",
  description: "Global: Toggle Debug Panel",
  keys: [],
  data: undefined,
};

export const Exit: Command = {
  id: "Exit",
  description: "Global: Exit",
  keys: [
    Key.create({ name: "F10" }),
  ],
  data: undefined,
};

export const Palette: Command = {
  id: "Palette",
  description: "Global: Open Palette",
  keys: [
    Key.create({ name: "F1" }),
    Key.create({ name: "F1", shift: true }),
    Key.create({ name: "F1", ctrl: true }),
    Key.create({ name: "F1", alt: true }),
    Key.create({ name: "F1", super: true }),
  ],
  data: undefined,
};

export const Paste: Command = {
  id: "Paste",
  description: "Edit: Paste",
  keys: [
    Key.create({ name: "v", ctrl: true }),
    Key.create({ name: "v", super: true }),
  ],
  data: undefined,
};

export const Redo: Command = {
  id: "Redo",
  description: "Edit: Redo",
  keys: [
    Key.create({ name: "y", ctrl: true }),
    Key.create({ name: "y", super: true }),
  ],
  data: undefined,
};

export const Save: Command = {
  id: "Save",
  description: "Global: Save",
  keys: [
    Key.create({ name: "F2" }),
  ],
  data: undefined,
};

export const SelectAll: Command = {
  id: "Select All",
  description: "Edit: Select All",
  keys: [
    Key.create({ name: "a", ctrl: true }),
    Key.create({ name: "a", super: true }),
  ],
  data: undefined,
};

export const ThemeBase16: Command = {
  id: "Theme Base16",
  description: "Theme: Base16",
  keys: [],
  data: undefined,
};

export const ThemeGray: Command = {
  id: "Theme Gray",
  description: "Theme: Gray",
  keys: [],
  data: undefined,
};

export const ThemeNeutral: Command = {
  id: "Theme Neutral",
  description: "Theme: Neutral",
  keys: [],
  data: undefined,
};

export const ThemeSlate: Command = {
  id: "Theme Slate",
  description: "Theme: Slate",
  keys: [],
  data: undefined,
};

export const ThemeStone: Command = {
  id: "Theme Stone",
  description: "Theme: Stone",
  keys: [],
  data: undefined,
};

export const ThemeZinc: Command = {
  id: "Theme Zinc",
  description: "Theme: Zinc",
  keys: [],
  data: undefined,
};

export const Undo: Command = {
  id: "Undo",
  description: "Edit: Undo",
  keys: [
    Key.create({ name: "z", ctrl: true }),
    Key.create({ name: "z", super: true }),
  ],
  data: undefined,
};

export const Whitespace: Command = {
  id: "Whitespace",
  description: "View: Toggle Render Whitespace",
  keys: [
    Key.create({ name: "F5" }),
  ],
  data: undefined,
};

export const Wrap: Command = {
  id: "Wrap",
  description: "View: Toggle Line Wrap",
  keys: [
    Key.create({ name: "F6" }),
  ],
  data: undefined,
};

export const Zen: Command = {
  id: "Zen",
  description: "Global: Toggle Zen Mode",
  keys: [
    Key.create({ name: "F11" }),
  ],
  data: undefined,
};

export const All: Command[] = [
  Copy,
  Cut,
  Debug,
  Exit,
  Palette,
  Paste,
  Redo,
  Save,
  SelectAll,
  ThemeBase16,
  ThemeGray,
  ThemeNeutral,
  ThemeSlate,
  ThemeStone,
  ThemeZinc,
  Undo,
  Whitespace,
  Wrap,
  Zen,
].sort((a, b) => a.description.localeCompare(b.description));
