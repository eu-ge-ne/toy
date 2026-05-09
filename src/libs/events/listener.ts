import { Clients } from "./clients.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";

export class Listener<IE extends InterceptorEvents, RE extends ReactorEvents> {
  constructor(private readonly clients: Clients<IE, RE>) {
  }

  intercept<E extends keyof IE>(name: E, fn: IE[E]): () => void {
    return this.interceptOrdered(name, 0, fn);
  }

  react<E extends keyof RE>(name: E, fn: RE[E]): () => void {
    return this.reactOrdered(name, 0, fn);
  }

  interceptOrdered<E extends keyof IE>(
    name: E,
    order: number,
    fn: IE[E],
  ): () => void {
    let xx = this.clients.Interceptors[name];
    if (!xx) {
      xx = this.clients.Interceptors[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offIntercept(name, fn);
  }

  reactOrdered<E extends keyof RE>(
    name: E,
    order: number,
    fn: RE[E],
  ): () => void {
    let xx = this.clients.Reactors[name];
    if (!xx) {
      xx = this.clients.Reactors[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offReact(name, fn);
  }

  #offIntercept<E extends keyof IE>(name: E, fn: IE[E]): void {
    const xx = this.clients.Interceptors[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }

  #offReact<E extends keyof RE>(name: E, fn: RE[E]): void {
    const xx = this.clients.Reactors[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }
}
