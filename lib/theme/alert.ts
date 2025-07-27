import { sgr } from "@eu-ge-ne/ctlseqs";

import { DANGER, LIGHTEST } from "./tokens.ts";

export const ALERT_BG = new Uint8Array([
  ...sgr(["bg", ...DANGER]),
]);

export const ALERT_COLORS = new Uint8Array([
  ...ALERT_BG,
  ...sgr(["fg", ...LIGHTEST]),
]);
