const enc = new TextEncoder();
const dec = new TextDecoder();

/**
 * The progressive enhancement flags.
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#id5}
 */
export interface Flags {
  disambiguate?: boolean;
  events?: boolean;
  alternates?: boolean;
  allKeys?: boolean;
  text?: boolean;
}

export const enum FlagsMode {
  Set = 1,
  Update = 2,
  Reset = 3,
}

export function setFlags(
  flags: Flags,
  mode: FlagsMode = FlagsMode.Set,
): Uint8Array {
  const f = stringifyFlags(flags);

  return enc.encode(`\x1b[=${f};${mode}u`);
}

export function pushFlags(flags: Flags): Uint8Array {
  const f = stringifyFlags(flags);

  return enc.encode(`\x1b[>${f}u`);
}

export function popFlags(number: number): Uint8Array {
  return enc.encode(`\x1b[<${number}u`);
}

export const queryFlags = enc.encode("\x1b[?u");

export function parseFlags(bytes: Uint8Array): Flags | undefined {
  const text = dec.decode(bytes);
  if (!text.startsWith("\x1b[?") || text.at(-1) !== "u") {
    return;
  }

  const f = Number.parseInt(text.slice(3, -1), 10);
  if (!Number.isSafeInteger(f)) {
    return;
  }

  const flags: Flags = {};

  if (f & 1) {
    flags.disambiguate = true;
  }

  if (f & 2) {
    flags.events = true;
  }

  if (f & 4) {
    flags.alternates = true;
  }

  if (f & 8) {
    flags.allKeys = true;
  }

  if (f & 16) {
    flags.text = true;
  }

  return flags;
}

function stringifyFlags(flags: Flags): string {
  let result = 0;

  if (flags.disambiguate) {
    result += 1;
  }

  if (flags.events) {
    result += 2;
  }

  if (flags.alternates) {
    result += 4;
  }

  if (flags.allKeys) {
    result += 8;
  }

  if (flags.text) {
    result += 16;
  }

  return result.toString();
}
