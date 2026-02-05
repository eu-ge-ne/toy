import { Key } from "@lib/kitty";

export interface Command<T = void> {
  keys: Key[];
  data: T;
}

export const Copy: Command = {
  keys: [
    Key.create({ name: "c", ctrl: true }),
    Key.create({ name: "c", super: true }),
  ],
  data: undefined,
};

export const Cut: Command = {
  keys: [
    Key.create({ name: "x", ctrl: true }),
    Key.create({ name: "x", super: true }),
  ],
  data: undefined,
};

export const Debug: Command = {
  keys: [],
  data: undefined,
};

export const Exit: Command = {
  keys: [
    Key.create({ name: "F10" }),
  ],
  data: undefined,
};

export const Palette: Command = {
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
  keys: [
    Key.create({ name: "v", ctrl: true }),
    Key.create({ name: "v", super: true }),
  ],
  data: undefined,
};

export const Redo: Command = {
  keys: [
    Key.create({ name: "y", ctrl: true }),
    Key.create({ name: "y", super: true }),
  ],
  data: undefined,
};

export const Save: Command = {
  keys: [
    Key.create({ name: "F2" }),
  ],
  data: undefined,
};

export const SelectAll: Command = {
  keys: [
    Key.create({ name: "a", ctrl: true }),
    Key.create({ name: "a", super: true }),
  ],
  data: undefined,
};

export const ThemeBase16: Command = {
  keys: [],
  data: undefined,
};

export const ThemeGray: Command = {
  keys: [],
  data: undefined,
};

export const ThemeNeutral: Command = {
  keys: [],
  data: undefined,
};

export const ThemeSlate: Command = {
  keys: [],
  data: undefined,
};

export const ThemeStone: Command = {
  keys: [],
  data: undefined,
};

export const ThemeZinc: Command = {
  keys: [],
  data: undefined,
};

export const Undo: Command = {
  keys: [
    Key.create({ name: "z", ctrl: true }),
    Key.create({ name: "z", super: true }),
  ],
  data: undefined,
};

export const Whitespace: Command = {
  keys: [
    Key.create({ name: "F5" }),
  ],
  data: undefined,
};

export const Wrap: Command = {
  keys: [
    Key.create({ name: "F6" }),
  ],
  data: undefined,
};

export const Zen: Command = {
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
];
