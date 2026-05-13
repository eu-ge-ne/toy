import { Clients } from "./clients.ts";
import { BroadcastedEvents, DispatchData, DispatchedEvents } from "./events.ts";

export class Emitter<
  DE extends DispatchedEvents,
  BE extends BroadcastedEvents,
> {
  constructor(private readonly clients: Clients<DE, BE>) {
  }

  async dispatch<E extends keyof DE>(
    name: E,
    data: Parameters<DE[E]>[0],
  ): Promise<void> {
    const xx = this.clients.Interceptors[name];
    if (!xx) {
      return;
    }

    for (const { fn } of xx) {
      await fn(data);

      if ((data as DispatchData).cancel) {
        return;
      }
    }
  }

  broadcast<E extends keyof BE>(name: E, ...data: Parameters<BE[E]>): void {
    const xx = this.clients.Reactors[name];
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
