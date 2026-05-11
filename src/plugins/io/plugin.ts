import * as api from "@libs/api";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

const clients = new events.Clients<
  api.IOInterceptorEvents,
  api.IOReactorEvents
>();

const emitter = new events.Emitter<
  api.IOInterceptorEvents,
  api.IOReactorEvents
>(clients);

const listener = new events.Listener<
  api.IOInterceptorEvents,
  api.IOReactorEvents
>(clients);

export default {
  ioApi(api: api.Api): api.IOApi {
    function resize(): void {
      emitter.react("resize");
    }

    function render(): void {
      const t0 = performance.now();

      vt.sync.bsu();
      vt.buf.write(vt.cursor.hide);

      emitter.react("render");

      vt.buf.write(vt.cursor.show);
      vt.buf.flush();
      vt.sync.esu();

      api.debug.render(performance.now() - t0);
    }

    async function keyPress(key: kitty.Key): Promise<void> {
      const t0 = performance.now();

      await emitter.intercept("key.press", { key });

      api.debug.input(performance.now() - t0);
    }

    Deno.addSignalListener("SIGWINCH", () => {
      resize();
      render();
    });

    api.intercept("start", async () => {
      globalThis.addEventListener("unhandledrejection", (e) => api.emitStop(e));
      vt.init();
    });

    api.interceptOrdered("stop", 1000, ({ e }) => {
      vt.restore();
      if (e) {
        console.log(e.reason);
      }
      Deno.exit(0);
    });

    return {
      events: listener,
      async runLoop(
        cb: (_: { continue: boolean; layoutChanged: boolean }) => void,
      ): Promise<void> {
        const ctx = { continue: true, layoutChanged: true };

        while (ctx.continue) {
          if (ctx.layoutChanged) {
            resize();
            ctx.layoutChanged = false;
          }

          render();

          const key = await vt.readKey();
          await keyPress(key);

          cb(ctx);
        }
      },
    };
  },
} satisfies plugins.Plugin;
