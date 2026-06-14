import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as vt from "@libs/vt";

export type CoreAPI = ReturnType<typeof CorePlugin>;

export function CorePlugin() {
  return {
    core: new Core(),
  };
}

class Core {
  private readonly eventEmitter = new events.EventEmitter<{
    "start": (_: events.EventData) => Promise<void>;
    "stop": (_: events.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
    "input": (_: events.EventData<{ key: kitty.Key }>) => Promise<void>;
  }>();

  private readonly signalEmitter = new events.SignalEmitter<{
    "resize": () => void;
    "render": () => void;
    "render.completed": (_: number) => void;
    "input.processed": (_: number) => void;
  }>();

  readonly events = this.eventEmitter.listener;
  readonly signals = this.signalEmitter.listener;

  async start(): Promise<void> {
    vt.init();

    this.resize();

    globalThis.addEventListener("unhandledrejection", (e) => this.stop(e));

    Deno.addSignalListener("SIGWINCH", () => {
      this.resize();
      this.#render();
    });

    await this.eventEmitter.dispatch("start", {});
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.eventEmitter.dispatch("stop", { e });

    vt.restore();

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }

  resize(): void {
    this.signalEmitter.broadcast("resize");
  }

  async loop(stop: () => unknown): Promise<void> {
    while (!stop()) {
      this.#render();

      const key = await vt.readKey();

      await this.#processInput(key);
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

  async #processInput(key: kitty.Key): Promise<void> {
    const t0 = performance.now();

    await this.eventEmitter.dispatch("input", { key });

    this.signalEmitter.broadcast("input.processed", performance.now() - t0);
  }
}
