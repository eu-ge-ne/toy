export interface Command<T = undefined> {
  name: string;
  data: T;
}

export const Copy: Command = {
  name: "Copy",
  data: undefined,
};

export const Cut: Command = {
  name: "Cut",
  data: undefined,
};

export const Debug: Command = {
  name: "Debug",
  data: undefined,
};

export const Exit: Command = {
  name: "Exit",
  data: undefined,
};

export const Palette: Command = {
  name: "Palette",
  data: undefined,
};

export const Paste: Command = {
  name: "Paste",
  data: undefined,
};

export const Redo: Command = {
  name: "Redo",
  data: undefined,
};

export const Save: Command = {
  name: "Save",
  data: undefined,
};

export const SelectAll: Command = {
  name: "SelectAll",
  data: undefined,
};

export const ThemeBase16: Command = {
  name: "ThemeBase16",
  data: undefined,
};

export const ThemeGray: Command = {
  name: "ThemeGray",
  data: undefined,
};

export const ThemeNeutral: Command = {
  name: "ThemeNeutral",
  data: undefined,
};

export const ThemeSlate: Command = {
  name: "ThemeSlate",
  data: undefined,
};

export const ThemeStone: Command = {
  name: "ThemeStone",
  data: undefined,
};

export const ThemeZinc: Command = {
  name: "ThemeZinc",
  data: undefined,
};

export const Undo: Command = {
  name: "Undo",
  data: undefined,
};

export const Whitespace: Command = {
  name: "Whitespace",
  data: undefined,
};

export const Wrap: Command = {
  name: "Wrap",
  data: undefined,
};

export const Zen: Command = {
  name: "Zen",
  data: undefined,
};
