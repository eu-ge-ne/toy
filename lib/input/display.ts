import { Key } from "@eu-ge-ne/kitty-keys";

export function display_key(key: Key | string): string {
  if (typeof key === "string") {
    return `"${key}"`;
  }

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

  chunks.push(name);

  return chunks.join("+");
}
