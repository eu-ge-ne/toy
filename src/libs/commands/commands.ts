export type Command = {
  name: "Copy";
} | {
  name: "Cut";
} | {
  name: "Paste";
} | {
  name: "Redo";
} | {
  name: "Save";
} | {
  name: "SelectAll";
} | {
  name: "Undo";
} | {
  name: "Whitespace";
} | {
  name: "Wrap";
};
