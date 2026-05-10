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
  name: "Undo";
};
