import { Clients } from "./clients.ts";
import { BroadcastedEvents, DispatchData, DispatchedEvents } from "./events.ts";

export class Emitter<
  IE extends DispatchedEvents,
  RE extends BroadcastedEvents,
> {
  constructor(private readonly clients: Clients<IE, RE>) {
  }

  async dispatch<E extends keyof IE>(
    name: E,
    data: Parameters<IE[E]>[0],
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

  broadcast<E extends keyof RE>(name: E, ...data: Parameters<RE[E]>): void {
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
