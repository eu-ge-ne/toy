import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";

const events = new libEvents.EventEmitter<api.IOEvents>();
const signals = new libEvents.SignalEmitter<api.IOSignals>();

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

export default {
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
  register: {
    io(toy: api.Toy): api.IO {
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
} satisfies plugins.Plugin;
