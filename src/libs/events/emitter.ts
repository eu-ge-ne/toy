import { AsyncInterceptors, Reactors, SyncInterceptors } from "./clients.ts";
import {
  AsyncInterceptorEvents,
  InterceptorData,
  ReactorEvents,
  SyncInterceptorEvents,
} from "./events.ts";

export class Emitter<
  A extends SyncInterceptorEvents,
  B extends AsyncInterceptorEvents,
  C extends ReactorEvents,
> {
  constructor(
    private readonly syncInterceptors: SyncInterceptors<A>,
    private readonly asyncInterceptors: AsyncInterceptors<B>,
    private readonly reactors: Reactors<C>,
  ) {
  }

  interceptSync<E extends keyof A>(name: E, data: Parameters<A[E]>[0]): void {
    const listeners = this.syncInterceptors[name];
    if (!listeners) {
      return;
    }

    for (const { fn } of listeners) {
      fn(data);
      if ((data as InterceptorData).cancel) {
        return;
      }
    }
  }

  async interceptAsync<E extends keyof B>(
    name: E,
    data: Parameters<B[E]>[0],
  ): Promise<void> {
    const listeners = this.asyncInterceptors[name];
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
