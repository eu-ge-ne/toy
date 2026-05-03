import { Interceptors, Reactors } from "./clients.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";

export class Listener<
  B extends InterceptorEvents,
  C extends ReactorEvents,
> {
  constructor(
    private readonly interceptors: Interceptors<B>,
    private readonly reactors: Reactors<C>,
  ) {
  }

  onIntercept<E extends keyof B>(name: E, fn: B[E], order = 0): void {
    let listeners = this.interceptors[name];
    if (!listeners) {
      listeners = this.interceptors[name] = [];
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

  offIntercept<E extends keyof B>(name: E, fn: B[E]): void {
    const listeners = this.interceptors[name];
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
