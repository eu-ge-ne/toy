import { AsyncInterceptors, Reactors, SyncInterceptors } from "./clients.ts";
import {
  AsyncInterceptorEvents,
  ReactorEvents,
  SyncInterceptorEvents,
} from "./events.ts";

export class Listener<
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

  onInterceptSync<E extends keyof A>(name: E, fn: A[E], order = 0): void {
    let listeners = this.syncInterceptors[name];
    if (!listeners) {
      listeners = this.syncInterceptors[name] = [];
    }
    listeners.push({ fn, order });
    listeners.sort((a, b) => a.order - b.order);
  }

  onInterceptAsync<E extends keyof B>(name: E, fn: B[E], order = 0): void {
    let listeners = this.asyncInterceptors[name];
    if (!listeners) {
      listeners = this.asyncInterceptors[name] = [];
    }
    listeners.push({ fn, order });
    listeners.sort((a, b) => a.order - b.order);
  }

  onReact<E extends keyof C>(name: E, fn: C[E], order = 0): void {
    let listeners = this.reactors[name];
    if (!listeners) {
      listeners = this.reactors[name] = [];
    }
    listeners.push({ fn, order });
    listeners.sort((a, b) => a.order - b.order);
  }

  offInterceptSync<E extends keyof A>(name: E, fn: A[E]): void {
    const listeners = this.syncInterceptors[name];
    if (!listeners) {
      return;
    }
    const i = listeners.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  }

  offInterceptAsync<E extends keyof B>(name: E, fn: B[E]): void {
    const listeners = this.asyncInterceptors[name];
    if (!listeners) {
      return;
    }
    const i = listeners.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  }

  offReact<E extends keyof C>(name: E, fn: C[E]): void {
    const listeners = this.reactors[name];
    if (!listeners) {
      return;
    }
    const i = listeners.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  }
}
