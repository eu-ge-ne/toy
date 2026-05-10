import { Themes } from "@libs/themes";

export type Command = {
  name: "Copy";
} | {
  name: "Cut";
} | {
  name: "Exit";
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
};
