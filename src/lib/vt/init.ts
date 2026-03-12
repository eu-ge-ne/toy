import { setFlags } from "@lib/kitty";

import { CSI } from "./ansi.ts";
import * as cursor from "./cursor.ts";
import { sync } from "./writer.ts";

export function init(): void {
  Deno.stdin.setRaw(true);

  sync.write(CSI("?1049h"));
  sync.write(setFlags({
    disambiguate: true,
    alternates: true,
    allKeys: true,
    text: true,
  }));
}

export function restore(): void {
  sync.write(CSI("?1049l"));
  sync.write(cursor.show);
}
