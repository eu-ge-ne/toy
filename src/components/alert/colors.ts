import { Theme } from "@lib/themes";

interface Colors {
  background: Uint8Array;
  text: Uint8Array;
}

export function colors(t: Theme): Colors {
  return {
    background: t.bg_danger,
    text: new Uint8Array([...t.bg_danger, ...t.fg_light1]),
  };
}
