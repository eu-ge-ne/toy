import { EventClients, SignalClients } from "./clients.ts";
import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export class Listener<T1 extends Events, T2 extends Signals> {
  constructor(
    private readonly eventClients: EventClients<T1>,
    private readonly signalClients: SignalClients<T2>,
  ) {
  }

  intercept<E extends keyof T1>(name: E, fn: T1[E]): () => void {
    return this.interceptOrdered(name, 0, fn);
  }

  react<N extends keyof T2>(name: N, fn: T2[N]): () => void {
    return this.reactOrdered(name, 0, fn);
  }

  interceptOrdered<E extends keyof T1>(
    name: E,
    order: number,
    fn: T1[E],
  ): () => void {
    let xx = this.eventClients[name];
    if (!xx) {
      xx = this.eventClients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offIntercept(name, fn);
  }

  reactOrdered<N extends keyof T2>(
    name: N,
    order: number,
    fn: T2[N],
  ): () => void {
    let xx = this.signalClients[name];
    if (!xx) {
      xx = this.signalClients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offReact(name, fn);
  }

  #offIntercept<E extends keyof T1>(name: E, fn: T1[E]): void {
    const xx = this.eventClients[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }

  #offReact<N extends keyof T2>(name: N, fn: T2[N]): void {
    const xx = this.signalClients[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }
}
