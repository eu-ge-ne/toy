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

function resize(): void {
  emitter.react("resize");
}

function render(api: api.Api): void {
  const t0 = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);

  emitter.react("render");

  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  api.debug.setRender(performance.now() - t0);
}

async function keyPress(api: api.Api, key: kitty.Key): Promise<void> {
  const t0 = performance.now();
  await emitter.intercept("key.press", { key });
  api.debug.setInput(performance.now() - t0);
}

export default {
  init(api: api.Api): void {
    api.runtime.events.intercept("start", async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        resize();
        render(api);
      });
    });

    api.runtime.events.interceptOrdered("stop", 1000, async () => {
      vt.restore();
    });
  },
  ioApi(api: api.Api): api.IOApi {
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

          render(api);

          const key = await vt.readKey();
          await keyPress(api, key);

          cb(ctx);
        }
      },
    };
  },
} satisfies plugins.Plugin;
