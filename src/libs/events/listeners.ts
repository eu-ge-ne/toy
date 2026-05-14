import { EventClients, SignalClients } from "./clients.ts";
import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export class Listener<T1 extends Events, T2 extends Signals> {
  constructor(
    private readonly eventClients: EventClients<T1>,
    private readonly signalClients: SignalClients<T2>,
  ) {
  }

  intercept<K extends keyof T1>(name: K, fn: T1[K]): () => void {
    return this.interceptOrdered(name, 0, fn);
  }

  react<K extends keyof T2>(name: K, fn: T2[K]): () => void {
    return this.reactOrdered(name, 0, fn);
  }

  interceptOrdered<K extends keyof T1>(
    name: K,
    order: number,
    fn: T1[K],
  ): () => void {
    let xx = this.eventClients[name];
    if (!xx) {
      xx = this.eventClients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offIntercept(name, fn);
  }

  reactOrdered<K extends keyof T2>(
    name: K,
    order: number,
    fn: T2[K],
  ): () => void {
    let xx = this.signalClients[name];
    if (!xx) {
      xx = this.signalClients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offReact(name, fn);
  }

  #offIntercept<K extends keyof T1>(name: K, fn: T1[K]): void {
    const xx = this.eventClients[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }

  #offReact<K extends keyof T2>(name: K, fn: T2[K]): void {
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
