import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

import { RuntimeAPI } from "@plugins/runtime";

export type IOAPI = ReturnType<typeof IOPlugin>;

export function IOPlugin(...api: ConstructorParameters<typeof IO>) {
  return {
    io: new IO(...api),
  };
}

class IO {
  private readonly eventEmitter = new events.EventEmitter<{
    "key.press": (_: events.EventData<{ key: kitty.Key }>) => Promise<void>;
  }>();

  private readonly signalEmitter = new events.SignalEmitter<{
    "resize": () => void;
    "render": () => void;
    "render.completed": (_: number) => void;
    "key.handled": (_: number) => void;
  }>();

  constructor(private readonly api: RuntimeAPI) {
    api.runtime.events.on("start")(async () => {
      vt.init();

      Deno.addSignalListener("SIGWINCH", () => {
        this.resize();
        this.#render();
      });
    });

    api.runtime.events.on("stop", 1000)(async () => vt.restore());
  }

  events = this.eventEmitter.listener;
  signals = this.signalEmitter.listener;

  resize(): void {
    this.signalEmitter.broadcast("resize");
  }

  async loop(stop: () => unknown): Promise<void> {
    while (!stop()) {
      this.#render();

      const key = await vt.readKey();

      await this.#keyPress(key);
    }
  }

  #render(): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    this.signalEmitter.broadcast("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    this.signalEmitter.broadcast("render.completed", performance.now() - t0);
  }

  async #keyPress(key: kitty.Key): Promise<void> {
    const t0 = performance.now();

    await this.eventEmitter.dispatch("key.press", { key });

    this.signalEmitter.broadcast("key.handled", performance.now() - t0);
  }
}
