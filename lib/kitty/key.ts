const PREFIX_RE = String.raw`(\x1b\x5b|\x1b\x4f)`;
const CODES_RE = String.raw`(?:(\d+)(?::(\d*))?(?::(\d*))?)?`;
const PARAMS_RE = String.raw`(?:;(\d*)?(?::(\d*))?)?`;
const CODEPOINTS_RE = String.raw`(?:;([\d:]*))?`;
const SCHEME_RE = String.raw`([u~ABCDEFHPQS])`;

const RE = new RegExp(
  PREFIX_RE + CODES_RE + PARAMS_RE + CODEPOINTS_RE + SCHEME_RE,
);

const decoder: TextDecoder = new TextDecoder();

/**
 * Represents key
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol}
 */
export class Key {
  /**
   * Name of the key
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#functional-key-definitions}
   */
  name = "";

  /**
   * Key codes
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#key-codes}
   */
  code?: {
    key?: number;
    shift?: number;
    base?: number;
  };

  /**
   * Text representation of the `event-type` sub-field
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#event-types}
   */
  event: "press" | "repeat" | "release" = "press";

  /**
   * Text representation of the `text-as-codepoints` field
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#text-as-code-points}
   */
  text?: string;

  /**
   * SHIFT
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#modifiers}
   */
  shift = false;

  /**
   * ALT/OPTION
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#modifiers}
   */
  alt = false;

  /**
   * CONTROL
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#modifiers}
   */
  ctrl = false;

  /**
   * SUPER/COMMAND
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#modifiers}
   */
  super = false;

  /**
   * CAPS LOCK
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#modifiers}
   */
  caps_lock = false;

  /**
   * NUM LOCK
   * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol/#modifiers}
   */
  num_lock = false;

  /**
   * Create key instance
   * @returns Key instance
   */
  static create(from: Partial<Key>): Key {
    return Object.assign(new Key(), from);
  }

  /**
   * Parse key from bytes
   * @param bytes
   * @returns the Key and the number of bytes parsed
   */
  static parse(bytes: Uint8Array): [Key, number] | undefined {
    if (bytes.length === 0) {
      return;
    }

    const b = bytes[0];

    if (b === 0x1b && bytes.length === 1) {
      const key = new Key();
      key.name = "ESC";
      return [key, 1];
    }

    if (b === 0x0d) {
      const key = new Key();
      key.name = "ENTER";
      return [key, 1];
    }

    if (b === 0x09) {
      const key = new Key();
      key.name = "TAB";
      return [key, 1];
    }

    if (b === 0x7f || b === 0x08) {
      const key = new Key();
      key.name = "BACKSPACE";
      return [key, 1];
    }

    if (b !== 0x1b) {
      let next_esc_i = bytes.indexOf(0x1b, 1);
      if (next_esc_i < 0) {
        next_esc_i = bytes.length;
      }
      const key = new Key();
      key.name = key.text = decoder.decode(bytes.subarray(0, next_esc_i));
      return [key, next_esc_i];
    }

    const match = decoder.decode(bytes).match(RE);
    if (!match) {
      return;
    }

    const key = new Key();

    const func_name = func_names[match[1]! + (match[2] ?? "") + match[8]!];
    if (typeof func_name === "string") {
      key.name = func_name;
    } else {
      const x = int(match[2]);
      if (typeof x === "number") {
        key.name = String.fromCodePoint(x);
      } else {
        key.name = match[1]! + match[8]!;
      }
    }

    key.code = {
      key: int(match[2])!,
      shift: int(match[3]),
      base: int(match[4]),
    };

    const modifiers = (int(match[5]) ?? 1) - 1;

    key.shift = Boolean(modifiers & 1);
    key.alt = Boolean(modifiers & 2);
    key.ctrl = Boolean(modifiers & 4);
    key.super = Boolean(modifiers & 8);
    key.caps_lock = Boolean(modifiers & 64);
    key.num_lock = Boolean(modifiers & 128);

    switch (match[6]) {
      case "2":
        key.event = "repeat";
        break;
      case "3":
        key.event = "release";
        break;
      default:
        key.event = "press";
        break;
    }

    if (match[7]) {
      key.text = String.fromCodePoint(
        ...match[7]
          .split(":")
          .map(int)
          .filter((x) => typeof x === "number"),
      );
    }

    return [key, match.index! + match[0].length];
  }
}

function int(text: string | undefined): number | undefined {
  if (text) {
    const n = Number.parseInt(text);
    if (Number.isSafeInteger(n)) {
      return n;
    }
  }
}

const func_names: Record<string, string> = {
  "\x1b[27u": "ESC",
  "\x1b[13u": "ENTER",
  "\x1b[9u": "TAB",
  "\x1b[127u": "BACKSPACE",

  "\x1b[2~": "INSERT",
  "\x1b[3~": "DELETE",

  "\x1b[1D": "LEFT",
  "\x1b[D": "LEFT",
  "\x1bOD": "LEFT",
  "\x1b[1C": "RIGHT",
  "\x1b[C": "RIGHT",
  "\x1bOC": "RIGHT",
  "\x1b[1A": "UP",
  "\x1b[A": "UP",
  "\x1bOA": "UP",
  "\x1b[1B": "DOWN",
  "\x1b[B": "DOWN",
  "\x1bOB": "DOWN",

  "\x1b[5~": "PAGE_UP",
  "\x1b[6~": "PAGE_DOWN",

  "\x1b[7~": "HOME",
  "\x1b[1H": "HOME",
  "\x1b[H": "HOME",
  "\x1bOH": "HOME",
  "\x1b[8~": "END",
  "\x1b[1F": "END",
  "\x1b[F": "END",
  "\x1bOF": "END",

  "\x1b[57358u": "CAPS_LOCK",
  "\x1b[57359u": "SCROLL_LOCK",
  "\x1b[57360u": "NUM_LOCK",
  "\x1b[57361u": "PRINT_SCREEN",
  "\x1b[57362u": "PAUSE",
  "\x1b[57363u": "MENU",

  "\x1b[11~": "F1",
  "\x1b[1P": "F1",
  "\x1b[P": "F1",
  "\x1bOP": "F1",

  "\x1b[12~": "F2",
  "\x1b[1Q": "F2",
  "\x1b[Q": "F2",
  "\x1bOQ": "F2",

  "\x1b[13~": "F3",
  "\x1bOR": "F3",

  "\x1b[14~": "F4",
  "\x1b[1S": "F4",
  "\x1b[S": "F4",
  "\x1bOS": "F4",

  "\x1b[15~": "F5",
  "\x1b[17~": "F6",
  "\x1b[18~": "F7",
  "\x1b[19~": "F8",
  "\x1b[20~": "F9",
  "\x1b[21~": "F10",
  "\x1b[23~": "F11",
  "\x1b[24~": "F12",

  "\x1b[57441u": "LEFT_SHIFT",
  "\x1b[57442u": "LEFT_CONTROL",
  "\x1b[57443u": "LEFT_ALT",
  "\x1b[57444u": "LEFT_SUPER",
  "\x1b[57447u": "RIGHT_SHIFT",
  "\x1b[57448u": "RIGHT_CONTROL",
  "\x1b[57449u": "RIGHT_ALT",
  "\x1b[57450u": "RIGHT_SUPER",
};
