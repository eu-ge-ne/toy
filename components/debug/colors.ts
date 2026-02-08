import { Theme } from "@lib/themes";

interface Colors {
  background: Uint8Array;
  text: Uint8Array;
}

export function colors(t: Theme): Colors {
  return {
    background: t.bg_light0,
    text: new Uint8Array([...t.bg_light0, ...t.fg_dark0]),
  };
}
