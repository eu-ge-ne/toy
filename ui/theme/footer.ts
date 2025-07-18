import { sgr } from "@eu-ge-ne/ctlseqs";

import { BOTTOM, DARK, DARKER } from "./tokens.ts";

export const FOOTER_BG = new Uint8Array([
  ...sgr(["bg", ...BOTTOM]),
]);

export const FOOTER_MESSAGE_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARK]),
]);

export const FOOTER_INVISIBLE_ON_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARK]),
]);

export const FOOTER_INVISIBLE_OFF_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARKER]),
]);

export const FOOTER_WRAP_ON_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARK]),
]);

export const FOOTER_WRAP_OFF_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARKER]),
]);

export const FOOTER_CURSOR_COLORS = new Uint8Array([
  ...FOOTER_BG,
  ...sgr(["fg", ...DARK]),
]);
