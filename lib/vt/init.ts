import { set_flags } from "@eu-ge-ne/kitty-keys";

import { CSI } from "./ansi.ts";
import * as cursor from "./cursor.ts";
import { sync } from "./sync.ts";

export function init(): void {
  Deno.stdin.setRaw(true);

  sync.write(CSI("?1049h"));
  sync.write(set_flags({
    disambiguate: true,
    alternates: true,
    all_keys: true,
    text: true,
  }));
}

export function restore(): void {
  sync.write(CSI("?1049l"));
  sync.write(cursor.show);
}
