import { Key } from "@eu-ge-ne/kitty-keys";

export function display_keys(
  keys: (Pick<Key, "name"> & Partial<Key>)[],
): string {
  return keys.map((x) => {
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
