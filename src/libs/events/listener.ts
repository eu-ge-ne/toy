import { Clients } from "./clients.ts";
import { Events } from "./events.ts";
import { Notifications } from "./notifications.ts";

export class Listener<EE extends Events, NN extends Notifications> {
  constructor(private readonly clients: Clients<EE, NN>) {
  }

  intercept<E extends keyof EE>(name: E, fn: EE[E]): () => void {
    return this.interceptOrdered(name, 0, fn);
  }

  react<N extends keyof NN>(name: N, fn: NN[N]): () => void {
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

  reactOrdered<N extends keyof NN>(
    name: N,
    order: number,
    fn: NN[N],
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

  #offReact<N extends keyof NN>(name: N, fn: NN[N]): void {
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
