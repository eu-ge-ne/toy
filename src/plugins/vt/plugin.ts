import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export class VTPlugin extends plugins.Plugin {
  #t0 = 0;

  override onStart(): void {
    vt.init();

    Deno.addSignalListener("SIGWINCH", () => {
      this.host.emitResize();
      this.host.emitRender();
    });
  }

  override onPreRender(): void {
    this.#t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);
  }

  override onPostRender(): void {
    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    this.host.emitRendered(performance.now() - this.#t0);
  }

  override onExit(): void {
    vt.restore();
  }
}
