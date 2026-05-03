import { Interceptors, Reactors } from "./clients.ts";
import { InterceptorData, InterceptorEvents, ReactorEvents } from "./events.ts";

export class Emitter<
  B extends InterceptorEvents,
  C extends ReactorEvents,
> {
  constructor(
    private readonly interceptors: Interceptors<B>,
    private readonly reactors: Reactors<C>,
  ) {
  }

  async intercept<E extends keyof B>(
    name: E,
    data: Parameters<B[E]>[0],
  ): Promise<void> {
    const listeners = this.interceptors[name];
    if (!listeners) {
      return;
    }

    for (const { fn } of listeners) {
      await fn(data);
      if ((data as InterceptorData).cancel) {
        return;
      }
    }
  }

  react<E extends keyof C>(name: E, ...data: Parameters<C[E]>): void {
    const listeners = this.reactors[name];
    if (!listeners) {
      return;
    }

    for (const { fn } of listeners) {
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
