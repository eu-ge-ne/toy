import { Clients } from "./clients.ts";
import { EventData, Events } from "./events.ts";
import { Listener } from "./listener.ts";
import { Signals } from "./signals.ts";

export class EventEmitter<T extends Events> {
  readonly #clients: Clients<T> = {};

  readonly listener = new Listener<T>(this.#clients);

  async dispatch<K extends keyof T>(name: K, data: Parameters<T[K]>[0]): Promise<void> {
    const xx = this.#clients[name];
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
}

export class SignalEmitter<T extends Signals> {
  readonly #clients: Clients<T> = {};

  readonly listener = new Listener<T>(this.#clients);

  broadcast<K extends keyof T>(name: K, ...data: Parameters<T[K]>): void {
    const xx = this.#clients[name];
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
