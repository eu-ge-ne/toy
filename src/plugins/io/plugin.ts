import * as libEvents from "@libs/events";
import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

import { RuntimeAPI } from "@plugins/runtime";

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
  "render.completed": (_: number) => void;
  "key.handled": (_: number) => void;
};

export function IOPlugin(api: RuntimeAPI): IOAPI {
  const events = new libEvents.EventEmitter<IOEvents>();
  const signals = new libEvents.SignalEmitter<IOSignals>();

  function resize(): void {
    signals.broadcast("resize");
  }

  function render(): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    signals.broadcast("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    signals.broadcast("render.completed", performance.now() - t0);
  }

  async function keyPress(key: kitty.Key): Promise<void> {
    const t0 = performance.now();

    await events.dispatch("key.press", { key });

    signals.broadcast("key.handled", performance.now() - t0);
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
