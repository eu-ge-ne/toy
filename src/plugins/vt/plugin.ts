import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export class VTPlugin extends plugins.Plugin {
  override onStart(): void {
    vt.init();

    Deno.addSignalListener("SIGWINCH", () => {
      this.host.emitResize();
      this.host.render();
    });
  }

  override onExit(): void {
    vt.restore();
  }
}
