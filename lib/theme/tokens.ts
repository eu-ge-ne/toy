import { Color, Colors, RED_900 } from "./colors.ts";

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

export function set_tokens(colors: Colors): void {
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
