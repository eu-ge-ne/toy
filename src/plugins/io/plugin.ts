import * as libEvents from "@libs/events";
import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

//import * as debug from "@plugins/debug";
import * as runtime from "@plugins/runtime";

export type IOAPI = {
  io: {
    events: libEvents.Listener<IOEvents>;
    signals: libEvents.Listener<IOSignals>;
    resize(): void;
    loop(_: () => unknown): Promise<void>;
  };
};

type IOEvents = {
  "key.press": (_: libEvents.EventData<{ key: kitty.Key }>) => Promise<void>;
};

type IOSignals = {
  "resize": () => void;
  "render": () => void;
};

export function IOPlugin(api: runtime.API): IOAPI {
  const events = new libEvents.EventEmitter<IOEvents>();
  const signals = new libEvents.SignalEmitter<IOSignals>();

  function resize(): void {
    signals.broadcast("resize");
  }

  function render(): void {
    //const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    signals.broadcast("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    //api.debug.setRender(performance.now() - t0);
  }

  async function keyPress(key: kitty.Key): Promise<void> {
    //const t0 = performance.now();

    await events.dispatch("key.press", { key });

    //api.debug.setInput(performance.now() - t0);
  }

  api.runtime.events.on("start")(async () => {
    vt.init();

    Deno.addSignalListener("SIGWINCH", () => {
      resize();
      render();
    });
  });

  api.runtime.events.on("stop", 1000)(async () => vt.restore());

  return {
    io: {
      events: events.listener,
      signals: signals.listener,
      resize,
      async loop(stop: () => unknown): Promise<void> {
        while (!stop()) {
          render();

          const key = await vt.readKey();

          await keyPress(key);
        }
      },
    },
  };
}
