import { set_flags } from "@eu-ge-ne/kitty-keys";

import { CSI } from "./ansi.ts";
import * as cursor from "./cursor.ts";
import { write } from "./write.ts";

export function init(): void {
  Deno.stdin.setRaw(true);

  write(
    CSI("?1049h"),
    set_flags({
      disambiguate: true,
      alternates: true,
      all_keys: true,
      text: true,
    }),
  );
}

export function restore(): void {
  write(
    CSI("?1049l"),
    cursor.show,
  );
}
