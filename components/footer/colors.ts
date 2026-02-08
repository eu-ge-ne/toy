import { Theme } from "@lib/themes";

interface Colors {
  background: Uint8Array;
  text: Uint8Array;
}

export function colors(t: Theme): Colors {
  return {
    background: t.bg_dark0,
    text: new Uint8Array([...t.bg_dark0, ...t.fg_dark0]),
  };
}
