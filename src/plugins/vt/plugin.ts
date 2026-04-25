import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export class VTPlugin extends plugins.Plugin {
  protected name = "VT";

  #t0 = 0;

  override register(): void {
    this.host.onState("Starting", this.name, async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        this.host.emitResize();
        this.host.emitRender();
      });
    });

    this.host.onState("Stopped", this.name, async () => {
      vt.restore();
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
}
