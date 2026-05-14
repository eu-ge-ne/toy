import { Clients } from "./clients.ts";
import {
  BroadcastedEvents,
  DispatchedData,
  DispatchedEvents,
} from "./events.ts";
import { Listener } from "./listener.ts";

export class Emitter<
  DE extends DispatchedEvents,
  BE extends BroadcastedEvents,
> {
  readonly #clients = new Clients<DE, BE>();
  readonly events = new Listener<DE, BE>(this.#clients);

  async dispatch<E extends keyof DE>(
    name: E,
    data: Parameters<DE[E]>[0],
  ): Promise<void> {
    const xx = this.#clients.Interceptors[name];
    if (!xx) {
      return;
    }

    for (const { fn } of xx) {
      await fn(data);

      if ((data as DispatchedData).cancel) {
        return;
      }
    }
  }

  broadcast<E extends keyof BE>(name: E, ...data: Parameters<BE[E]>): void {
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
