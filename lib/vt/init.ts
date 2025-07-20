import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";
import { set_flags } from "@eu-ge-ne/kitty-keys";

import * as cursor from "./cursor.ts";
import { flush } from "./write.ts";

export function init_vt(): void {
  Deno.stdin.setRaw(true);

  flush(
    decset(DECSetMode.ALTSCR),
    set_flags({
      disambiguate: true,
      alternates: true,
      all_keys: true,
      text: true,
    }),
  );
}

export function restore_vt(): void {
  flush(
    decrst(DECResetMode.ALTSCR),
    cursor.show,
  );
}
