export type Color = [number, number, number];

export type Colors = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  Color
>;

export const SLATE: Colors = {
  50: [0xf8, 0xfa, 0xfc],
  100: [0xf1, 0xf5, 0xf9],
  200: [0xe2, 0xe8, 0xf0],
  300: [0xcb, 0xd5, 0xe1],
  400: [0x94, 0xa3, 0xb8],
  500: [0x64, 0x74, 0x8b],
  600: [0x47, 0x55, 0x69],
  700: [0x33, 0x41, 0x55],
  800: [0x1e, 0x29, 0x3b],
  900: [0x0f, 0x17, 0x2a],
  950: [0x02, 0x06, 0x17],
};

export const NEUTRAL: Colors = {
  50: [0xfa, 0xfa, 0xfa],
  100: [0xf5, 0xf5, 0xf5],
  200: [0xe5, 0xe5, 0xe5],
  300: [0xd4, 0xd4, 0xd4],
  400: [0xa3, 0xa3, 0xa3],
  500: [0x73, 0x73, 0x73],
  600: [0x52, 0x52, 0x52],
  700: [0x40, 0x40, 0x40],
  800: [0x26, 0x26, 0x26],
  900: [0x17, 0x17, 0x17],
  950: [0x0a, 0x0a, 0x0a],
};

const RED_900: Color = [0x7f, 0x1d, 0x1d];

export const DANGER = RED_900;

export let TOP: Color;
export let HIGHEST: Color;
export let HIGHER: Color;
export let LOWER: Color;
export let LOWEST: Color;

export let BRIGHT: Color;
export let LIGHTEST: Color;
export let LIGHT: Color;
export let DARK: Color;
export let DARKER: Color;
export let DARKEST: Color;

export function set_colors(colors: Colors): void {
  TOP = colors[500];
  HIGHEST = colors[700];
  HIGHER = colors[800];
  LOWER = colors[900];
  LOWEST = colors[950];

  BRIGHT = colors[100];
  LIGHTEST = colors[200];
  LIGHT = colors[300];
  DARK = colors[400];
  DARKER = colors[600];
  DARKEST = colors[700];
}
