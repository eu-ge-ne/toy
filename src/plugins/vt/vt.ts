import { Plugin } from "@libs/plugins";
import * as vt from "@libs/vt";

export class VT extends Plugin {
  start(): void {
    const { onExit, onRefresh } = this.props;

    vt.init();

    if (onExit) {
      globalThis.addEventListener("unhandledrejection", onExit);
    }

    if (onRefresh) {
      Deno.addSignalListener("SIGWINCH", onRefresh);
    }
  }

  stop(): void {
    vt.restore();
  }
}
