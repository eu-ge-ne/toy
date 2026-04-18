import { Plugin } from "@libs/plugins";
import * as vt from "@libs/vt";

export class VT extends Plugin {
  start(): void {
    vt.init();

    Deno.addSignalListener("SIGWINCH", () => this.host.refresh());
  }

  exit(): void {
    vt.restore();
  }
}
