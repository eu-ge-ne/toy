import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export class VTPlugin extends plugins.Plugin {
  #t0 = 0;

  override async onStart(): Promise<void> {
    vt.init();

    Deno.addSignalListener("SIGWINCH", () => {
      this.host.resize();
      this.host.emitRender();
    });
  }

  override async onStop(): Promise<void> {
    vt.restore();
  }

  override onRenderBefore(): void {
    this.#t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);
  }

  override onRenderAfter(): void {
    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    this.host.emitDebug({ renderElapsed: performance.now() - this.#t0 });
  }
}
