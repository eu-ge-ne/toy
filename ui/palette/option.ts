import { Key, shortcut } from "@lib/key";

export class PaletteOption {
  id: string;
  description: string;
  shortcuts: string;

  constructor(id: string, description: string, keys: Key[]) {
    this.id = id;
    this.description = description;
    this.shortcuts = keys.map(shortcut).join(" ");
  }
}
