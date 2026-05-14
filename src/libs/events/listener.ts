import { Clients } from "./clients.ts";
import { BroadcastedEvents, Events } from "./events.ts";

export class Listener<EE extends Events, BE extends BroadcastedEvents> {
  constructor(private readonly clients: Clients<EE, BE>) {
  }

  intercept<E extends keyof EE>(name: E, fn: EE[E]): () => void {
    return this.interceptOrdered(name, 0, fn);
  }

  react<E extends keyof BE>(name: E, fn: BE[E]): () => void {
    return this.reactOrdered(name, 0, fn);
  }

  interceptOrdered<E extends keyof EE>(
    name: E,
    order: number,
    fn: EE[E],
  ): () => void {
    let xx = this.clients.Interceptors[name];
    if (!xx) {
      xx = this.clients.Interceptors[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offIntercept(name, fn);
  }

  reactOrdered<E extends keyof BE>(
    name: E,
    order: number,
    fn: BE[E],
  ): () => void {
    let xx = this.clients.Reactors[name];
    if (!xx) {
      xx = this.clients.Reactors[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offReact(name, fn);
  }

  #offIntercept<E extends keyof EE>(name: E, fn: EE[E]): void {
    const xx = this.clients.Interceptors[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }

  #offReact<E extends keyof BE>(name: E, fn: BE[E]): void {
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
