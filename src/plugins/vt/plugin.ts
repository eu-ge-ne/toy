import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export class VTPlugin extends plugins.Plugin {
  override start(): void {
    vt.init();

    Deno.addSignalListener("SIGWINCH", () => this.host.handleRefresh());
  }

  override exit(): void {
    vt.restore();
  }
}
