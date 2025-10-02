import { Key } from "./key.ts";

export * from "./key.ts";

export function shortcut(key: Key): string {
  const chunks: string[] = [];

  if (key.shift) {
    chunks.push("⇧");
  }

  if (key.ctrl) {
    chunks.push("⌃");
  }

  if (key.alt) {
    chunks.push("⌥");
  }

  if (key.super) {
    chunks.push("⌘");
  }

  chunks.push(key.name.toUpperCase());

  return chunks.join("");
}
