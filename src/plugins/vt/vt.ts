import { Plugin, PluginParams } from "@libs/plugins";
import * as vt from "@libs/vt";

export class VT extends Plugin {
  constructor(params: PluginParams) {
    super(params);
  }

  override start(): void {
    const { onExit, onRefresh } = this.params;

    vt.init();

    if (onExit) {
      globalThis.addEventListener("unhandledrejection", onExit);
    }

    if (onRefresh) {
      Deno.addSignalListener("SIGWINCH", onRefresh);
    }
  }

  override stop(): void {
    vt.restore();
  }
}
