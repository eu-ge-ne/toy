import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";
import { set_flags } from "@eu-ge-ne/kitty-keys";

import * as cursor from "./cursor.ts";
import { write_direct } from "./write.ts";

export function init(): void {
  Deno.stdin.setRaw(true);

  write_direct(
    decset(DECSetMode.ALTSCR),
    set_flags({
      disambiguate: true,
      alternates: true,
      all_keys: true,
      text: true,
    }),
  );
}

export function restore(): void {
  write_direct(
    decrst(DECResetMode.ALTSCR),
    cursor.show,
  );
}
