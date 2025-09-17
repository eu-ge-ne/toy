import { Key } from "@lib/vt";

export class PaletteOption {
  id: string;
  description: string;
  shortcuts: string;

  constructor(id: string, description: string, keys: Key[]) {
    this.id = id;
    this.description = description;

    this.shortcuts = keys.map((x) => {
      const chunks: string[] = [];

      if (x.shift) {
        chunks.push("⇧");
      }

      if (x.ctrl) {
        chunks.push("⌃");
      }

      if (x.alt) {
        chunks.push("⌥");
      }

      if (x.super) {
        chunks.push("⌘");
      }

      chunks.push(x.name.toUpperCase());

      return chunks.join("");
    }).join(" ");
  }
}
