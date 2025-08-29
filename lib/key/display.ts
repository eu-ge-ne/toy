import { KittyKey } from "@eu-ge-ne/kitty-keys";

export function display_keys(keys: KittyKey[]): string {
  return keys.map((key) => {
    const { shift, ctrl, alt, super: super_, name } = key;

    const chunks: string[] = [];

    if (shift) {
      chunks.push("⇧");
    }

    if (ctrl) {
      chunks.push("⌃");
    }

    if (alt) {
      chunks.push("⌥");
    }

    if (super_) {
      chunks.push("⌘");
    }

    chunks.push(name.toUpperCase());

    return chunks.join("");
  }).join(" ");
}
