import * as api from "@libs/api";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export default class IOPlugin extends plugins.Plugin {
  #evs = events.create<api.IOInterceptorEvents, api.IOReactorEvents>();

  override init(api: api.Host): void {
    api.runtime.events.intercept("start", async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        this.#resize();
        this.#render(api);
      });
    });

    api.runtime.events.interceptOrdered("stop", 1000, async () => {
      vt.restore();
    });
  }

  override initIO(api: api.Host): api.IOAPI {
    return {
      events: this.#evs.listener,
      runLoop: async (
        cb: (_: { continue: boolean; layoutChanged: boolean }) => void,
      ) => {
        const ctx = { continue: true, layoutChanged: true };

        while (ctx.continue) {
          if (ctx.layoutChanged) {
            this.#resize();
            ctx.layoutChanged = false;
          }

          this.#render(api);

          const key = await vt.readKey();
          await this.#keyPress(api, key);

          cb(ctx);
        }
      },
    };
  }

  #resize(): void {
    this.#evs.emitter.broadcast("resize");
  }

  #render(api: api.Host): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    this.#evs.emitter.broadcast("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    api.debug.setRender(performance.now() - t0);
  }

  async #keyPress(api: api.Host, key: kitty.Key): Promise<void> {
    const t0 = performance.now();

    await this.#evs.emitter.dispatch("key.press", { key });

    api.debug.setInput(performance.now() - t0);
  }
}
