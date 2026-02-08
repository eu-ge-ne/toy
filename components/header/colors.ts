import { Theme } from "@lib/themes";

interface Colors {
  background: Uint8Array;
  filePath: Uint8Array;
  isDirty: Uint8Array;
}

export function colors(t: Theme): Colors {
  return {
    background: t.bg_dark0,
    filePath: new Uint8Array([...t.bg_dark0, ...t.fg_dark0]),
    isDirty: new Uint8Array([...t.bg_dark0, ...t.fg_light2]),
  };
}
