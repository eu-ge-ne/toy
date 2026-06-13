import * as events from "@libs/events";
import * as libEvents from "@libs/events";
import * as kitty from "@libs/kitty";
import "@libs/plugins";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

declare module "@libs/plugins" {
  export interface API {
    io: {
      events: events.Listener<IOEvents>;
      signals: events.Listener<IOSignals>;
      resize(): void;
      loop(_: () => unknown): Promise<void>;
    };
  }
}

type IOEvents = {
  "key.press": (_: events.EventData<{ key: kitty.Key }>) => Promise<void>;
};

type IOSignals = {
  "resize": () => void;
  "render": () => void;
};

export function plugin(api: plugins.API): plugins.Result {
  const events = new libEvents.EventEmitter<IOEvents>();
  const signals = new libEvents.SignalEmitter<IOSignals>();

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
