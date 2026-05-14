import { Clients } from "./clients.ts";
import { EventData, Events } from "./events.ts";
import { Listener } from "./listener.ts";
import { Signals } from "./signals.ts";

export class Emitter<EE extends Events, NN extends Signals> {
  readonly #clients = new Clients<EE, NN>();
  readonly events = new Listener<EE, NN>(this.#clients);

  async dispatch<E extends keyof EE>(
    name: E,
    data: Parameters<EE[E]>[0],
  ): Promise<void> {
    const xx = this.#clients.Interceptors[name];
    if (!xx) {
      return;
    }

    for (const { fn } of xx) {
      await fn(data);

      if ((data as EventData).cancel) {
        return;
      }
    }
  }

  broadcast<N extends keyof NN>(name: N, ...data: Parameters<NN[N]>): void {
    const xx = this.#clients.Reactors[name];
    if (!xx) {
      return;
    }

    for (const { fn } of xx) {
      try {
        const result = fn(...data);
        if (result instanceof Promise) {
          result.catch((err) => console.error(err));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}
