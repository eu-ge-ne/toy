import * as libEvents from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

export function plugin(api: plugins.API): plugins.Plugin {
  const events = new libEvents.EventEmitter<plugins.IOEvents>();
  const signals = new libEvents.SignalEmitter<plugins.IOSignals>();

  function resize(): void {
    signals.broadcast("resize");
  }

  function render(api: plugins.API): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    signals.broadcast("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    api.debug.setRender(performance.now() - t0);
  }

  async function keyPress(api: plugins.API, key: kitty.Key): Promise<void> {
    const t0 = performance.now();

    await events.dispatch("key.press", { key });

    api.debug.setInput(performance.now() - t0);
  }

  return {
    io: {
      events: events.listener,
      signals: signals.listener,
      resize,
      async loop(stop: () => unknown): Promise<void> {
        while (!stop()) {
          render(api);

          const key = await vt.readKey();

          await keyPress(api, key);
        }
      },
    },

    init(): void {
      api.runtime.events.on("start")(async () => {
        vt.init();

        Deno.addSignalListener("SIGWINCH", () => {
          resize();
          render(api);
        });
      });

      api.runtime.events.on("stop", 1000)(async () => vt.restore());
    },
  };
}
