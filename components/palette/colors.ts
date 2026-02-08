import { Theme } from "@lib/themes";

interface Colors {
  background: Uint8Array;
  option: Uint8Array;
  selectedOption: Uint8Array;
}

export function colors(t: Theme): Colors {
  return {
    background: t.bg_light1,
    option: new Uint8Array([...t.bg_light1, ...t.fg_light1]),
    selectedOption: new Uint8Array([...t.bg_light2, ...t.fg_light1]),
  };
}
