import { func } from "./func.ts";

const PREFIX_RE = String.raw`(\x1b\x5b|\x1b\x4f)`; // 1
const CODES_RE = String.raw`(?:(\d+)(?::(\d*))?(?::(\d*))?)?`; // 2 3 4
const PARAMS_RE = String.raw`(?:;(\d*)?(?::(\d*))?)?`; // 5 6
const CODEPOINTS_RE = String.raw`(?:;([\d:]*))?`; // 7
const SCHEME_RE = String.raw`([u~ABCDEFHPQS])`; // 8

const RE = new RegExp(
  PREFIX_RE + CODES_RE + PARAMS_RE + CODEPOINTS_RE + SCHEME_RE,
);

const dec = new TextDecoder();

/**
 * Represents key
 * @see {@link https://sw.kovidgoyal.net/kitty/keyboard-protocol}
 */
export interface Key {
  name: string;

  event?: "repeat" | "release";

  keyCode?: number;
  shiftCode?: number;
  baseCode?: number;

  text?: string;

  shift?: boolean;
  alt?: boolean;
  ctrl?: boolean;
  super?: boolean;
  capsLock?: boolean;
  numLock?: boolean;
}

export function parse(data: Uint8Array): [Key, number] | undefined {
  if (data.byteLength === 0) {
    return;
  }

  const b = data[0];

  if (data.byteLength === 1) {
    if (b === 0x1b) {
      return [{ name: "ESC" }, 1];
    }

    if (b === 0x0d) {
      return [{ name: "ENTER" }, 1];
    }

    if (b === 0x09) {
      return [{ name: "TAB" }, 1];
    }

    if (b === 0x7f || b === 0x08) {
      return [{ name: "BACKSPACE" }, 1];
    }
  }

  if (b !== 0x1b) {
    let escI = data.indexOf(0x1b, 1);
    if (escI < 0) {
      escI = data.byteLength;
    }
    const name = dec.decode(data.subarray(0, escI));
    return [{ name, text: name }, escI];
  }

  const match = dec.decode(data).match(RE);
  if (!match) {
    return;
  }

  let name = func[match[1]! + (match[2] ?? "") + match[8]!];
  if (typeof name !== "string") {
    const x = toInt(match[2]);
    if (typeof x === "number") {
      name = String.fromCodePoint(x);
    } else {
      name = match[1]! + match[8]!;
    }
  }

  const key: Key = { name };

  if (match[2]) {
    key.keyCode = toInt(match[2]);
  }

  if (match[3]) {
    key.shiftCode = toInt(match[3]);
  }

  if (match[4]) {
    key.baseCode = toInt(match[4]);
  }

  const modifiers = (toInt(match[5]) ?? 1) - 1;

  if (modifiers & 1) {
    key.shift = true;
  }

  if (modifiers & 2) {
    key.alt = true;
  }

  if (modifiers & 4) {
    key.ctrl = true;
  }

  if (modifiers & 8) {
    key.super = true;
  }

  if (modifiers & 64) {
    key.capsLock = true;
  }

  if (modifiers & 128) {
    key.numLock = true;
  }

  switch (match[6]) {
    case "2":
      key.event = "repeat";
      break;
    case "3":
      key.event = "release";
      break;
  }

  if (match[7]) {
    key.text = String.fromCodePoint(
      ...match[7]
        .split(":")
        .map(toInt)
        .filter((x) => typeof x === "number"),
    );
  }

  return [key, match.index! + match[0].length];
}

function toInt(text: string | undefined): number | undefined {
  if (!text) {
    return;
  }

  const n = Number.parseInt(text);

  if (Number.isSafeInteger(n)) {
    return n;
  }
}
