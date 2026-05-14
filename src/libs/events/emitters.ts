import { EventClients, SignalClients } from "./clients.ts";
import { EventData, Events } from "./events.ts";
import { Listener } from "./listeners.ts";
import { Signals } from "./signals.ts";

export class Emitter<T1 extends Events, T2 extends Signals> {
  readonly #eventClients: EventClients<T1> = {};
  readonly #signalClients: SignalClients<T2> = {};

  readonly events = new Listener<T1, T2>(
    this.#eventClients,
    this.#signalClients,
  );

  async dispatch<K extends keyof T1>(
    name: K,
    data: Parameters<T1[K]>[0],
  ): Promise<void> {
    const xx = this.#eventClients[name];
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

  broadcast<K extends keyof T2>(name: K, ...data: Parameters<T2[K]>): void {
    const xx = this.#signalClients[name];
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
