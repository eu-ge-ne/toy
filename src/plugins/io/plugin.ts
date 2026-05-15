import * as api from "@libs/api";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

const eventEmitter = new events.EventEmitter<api.IOEvents>();
const signalEmitter = new events.SignalEmitter<api.IOSignals>();

function resize(): void {
  signalEmitter.broadcast("resize");
}

function render(host: api.Host): void {
  const t0 = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);

  signalEmitter.broadcast("render");

  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  host.debug.setRender(performance.now() - t0);
}

async function keyPress(host: api.Host, key: kitty.Key): Promise<void> {
  const t0 = performance.now();

  await eventEmitter.dispatch("key.press", { key });

  host.debug.setInput(performance.now() - t0);
}

export default {
  init(host: api.Host): void {
    host.runtime.events.on("start")(async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        resize();
        render(host);
      });
    });

    host.runtime.events.on("stop", 1000)(async () => vt.restore());
  },
  initIO(host: api.Host): api.IO {
    return {
      events: eventEmitter.events,
      signals: signalEmitter.signals,
      async loop(cb: (_: { continue: boolean; layoutChanged: boolean }) => void): Promise<void> {
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
