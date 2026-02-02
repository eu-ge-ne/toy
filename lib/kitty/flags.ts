const encoder: TextEncoder = new TextEncoder();
const decoder: TextDecoder = new TextDecoder();

/**
 * The progressive enhancement flags.
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#id5}
 */
export interface Flags {
  /**
   * 0b1 (1) Disambiguate escape codes.
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#disambiguate-escape-codes}
   */
  disambiguate?: boolean;

  /**
   * 0b10 (2) Report event types.
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#report-events}
   */
  events?: boolean;

  /**
   * 0b100 (4) Report alternate keys.
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#report-alternates}
   */
  alternates?: boolean;

  /**
   * 0b1000 (8) Report all keys as escape codes.
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#report-all-keys}
   */
  all_keys?: boolean;

  /**
   * 0b10000 (16) Report associated text.
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#report-text}
   */
  text?: boolean;
}

/**
 * Set flags mode
 */
export const enum FlagsMode {
  Set = 1,
  Update = 2,
  Reset = 3,
}

/**
 * Serializes `Set progressive enhancement flags` request to bytes
 * @param flags
 * @param mode
 * @returns bytes
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement}
 */
export function set_flags(
  flags: Flags,
  mode: FlagsMode = FlagsMode.Set,
): Uint8Array {
  const f = stringify_flags(flags);

  return encoder.encode(`\x1b[=${f};${mode}u`);
}

/**
 * Serializes `Push progressive enhancement flags` request to bytes.
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement}
 */
export function push_flags(flags: Flags): Uint8Array {
  const f = stringify_flags(flags);

  return encoder.encode(`\x1b[>${f}u`);
}

/**
 * Serializes `Pop progressive enhancement flags` request to bytes.
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement}
 */
export function pop_flags(number: number): Uint8Array {
  return encoder.encode(`\x1b[<${number}u`);
}

/**
 * Serialized `Query progressive enhancement flags` request.
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement}
 */
export const query_flags: Uint8Array = encoder.encode("\x1b[?u");

/**
 * Parses progressive enhancement flags reply from bytes.
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement}
 */
export function parse_flags(bytes: Uint8Array): Flags | undefined {
  const text = decoder.decode(bytes);
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
    flags.all_keys = true;
  }

  if (f & 16) {
    flags.text = true;
  }

  return flags;
}

function stringify_flags(flags: Flags): string {
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

  if (flags.all_keys) {
    result += 8;
  }

  if (flags.text) {
    result += 16;
  }

  return result.toString();
}
