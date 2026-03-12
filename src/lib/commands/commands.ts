import { Themes } from "@lib/themes";

export type Command = {
  name: "Copy";
} | {
  name: "Cut";
} | {
  name: "Debug";
} | {
  name: "Exit";
} | {
  name: "Palette";
} | {
  name: "Paste";
} | {
  name: "Redo";
} | {
  name: "Save";
} | {
  name: "SelectAll";
} | {
  name: "Theme";
  data: keyof typeof Themes;
} | {
  name: "Undo";
} | {
  name: "Whitespace";
} | {
  name: "Wrap";
} | {
  name: "Zen";
};
