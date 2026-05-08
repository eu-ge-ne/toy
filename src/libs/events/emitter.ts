import { Clients } from "./clients.ts";
import { InterceptorData, InterceptorEvents, ReactorEvents } from "./events.ts";

export class Emitter<IE extends InterceptorEvents, RE extends ReactorEvents> {
  constructor(private readonly clients: Clients<IE, RE>) {
  }

  async intercept<E extends keyof IE>(
    name: E,
    data: Parameters<IE[E]>[0],
  ): Promise<void> {
    const xx = this.clients.Interceptors[name];
    if (!xx) {
      return;
    }

    for (const { fn } of xx) {
      await fn(data);

      if ((data as InterceptorData).cancel) {
        return;
      }
    }
  }

  react<E extends keyof RE>(name: E, ...data: Parameters<RE[E]>): void {
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
