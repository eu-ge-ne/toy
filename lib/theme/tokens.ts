// deno-lint-ignore-file no-unused-vars
const NEUTRAL_50 = [0xfa, 0xfa, 0xfa] as const;
const NEUTRAL_100 = [0xf5, 0xf5, 0xf5] as const;
const NEUTRAL_200 = [0xe5, 0xe5, 0xe5] as const;
const NEUTRAL_300 = [0xd4, 0xd4, 0xd4] as const;
const NEUTRAL_400 = [0xa3, 0xa3, 0xa3] as const;
const NEUTRAL_500 = [0x73, 0x73, 0x73] as const;
const NEUTRAL_600 = [0x52, 0x52, 0x52] as const;
const NEUTRAL_700 = [0x40, 0x40, 0x40] as const;
const NEUTRAL_800 = [0x26, 0x26, 0x26] as const;
const NEUTRAL_900 = [0x17, 0x17, 0x17] as const;
const NEUTRAL_950 = [0x0a, 0x0a, 0x0a] as const;

const RED_900 = [0x7f, 0x1d, 0x1d] as const;

export const DANGER = RED_900;

export const TOP = NEUTRAL_500;
export const HIGHEST = NEUTRAL_700;
export const HIGHER = NEUTRAL_800;
export const LOWER = NEUTRAL_900;
export const LOWEST = NEUTRAL_950;

export const BRIGHT = NEUTRAL_100;
export const LIGHTEST = NEUTRAL_200;
export const LIGHT = NEUTRAL_300;
export const DARK = NEUTRAL_400;
export const DARKER = NEUTRAL_600;
export const DARKEST = NEUTRAL_700;
