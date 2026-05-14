import * as api from "@libs/api";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

const emitter = new events.Emitter<
  api.IOInterceptorEvents,
  api.IOReactorEvents
>();

function resize(): void {
  emitter.broadcast("resize");
}

function render(api: api.Host): void {
  const t0 = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);

  emitter.broadcast("render");

  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  api.debug.setRender(performance.now() - t0);
}

async function keyPress(api: api.Host, key: kitty.Key): Promise<void> {
  const t0 = performance.now();

  await emitter.dispatch("key.press", { key });

  api.debug.setInput(performance.now() - t0);
}

export default {
  init(host: api.Host): void {
    host.runtime.events.intercept("start", async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        resize();
        render(host);
      });
    });

    host.runtime.events.interceptOrdered("stop", 1000, async () => {
      vt.restore();
    });
  },
  initIO(host: api.Host): api.IO {
    return {
      events: emitter.events,
      async runLoop(
        cb: (_: { continue: boolean; layoutChanged: boolean }) => void,
      ): Promise<void> {
        const ctx = { continue: true, layoutChanged: true };

        while (ctx.continue) {
          if (ctx.layoutChanged) {
            resize();
            ctx.layoutChanged = false;
          }

          render(host);

          const key = await vt.readKey();
          await keyPress(host, key);

          cb(ctx);
        }
      },
    };
  },
} satisfies plugins.Plugin;
