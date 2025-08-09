import { text } from "../ansi.ts";

export function spaces(n: number): Uint8Array {
  return text(` \x1b[${n - 1}b`);
}
