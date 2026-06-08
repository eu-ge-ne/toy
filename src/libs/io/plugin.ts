import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

import { IOAPI, IOEvents, IOSignals } from "./api.ts";

let events: libEvents.EventEmitter<IOEvents>;
let signals: libEvents.SignalEmitter<IOSignals>;

export const plugin = {
  register: {
    io(toy: api.Toy): IOAPI {
      events = new libEvents.EventEmitter<IOEvents>();
      signals = new libEvents.SignalEmitter<IOSignals>();

      return {
        events: events.listener,
        signals: signals.listener,
        resize,
        async loop(stop: () => unknown): Promise<void> {
          while (!stop()) {
            render(toy);

            const key = await vt.readKey();

            await keyPress(toy, key);
          }
        },
      };
    },
  },

  init(toy: api.Toy): void {
    toy.runtime.events.on("start")(async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        resize();
        render(toy);
      });
    });

    toy.runtime.events.on("stop", 1000)(async () => vt.restore());
  },
} satisfies plugins.Plugin;

function resize(): void {
  signals.broadcast("resize");
}

function render(toy: api.Toy): void {
  const t0 = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);

  signals.broadcast("render");

  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  toy.debug.setRender(performance.now() - t0);
}

async function keyPress(toy: api.Toy, key: kitty.Key): Promise<void> {
  const t0 = performance.now();

  await events.dispatch("key.press", { key });

  toy.debug.setInput(performance.now() - t0);
}
