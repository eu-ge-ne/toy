import { EventClients, SignalClients } from "./clients.ts";
import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export class EventListener<T extends Events> {
  constructor(private readonly clients: EventClients<T>) {
  }

  on<K extends keyof T>(name: K, fn: T[K]): () => void {
    return this.onOrdered(name, 0, fn);
  }

  onOrdered<K extends keyof T>(name: K, order: number, fn: T[K]): () => void {
    let xx = this.clients[name];
    if (!xx) {
      xx = this.clients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#off(name, fn);
  }

  #off<K extends keyof T>(name: K, fn: T[K]): void {
    const xx = this.clients[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }
}

export class SignalListener<T extends Signals> {
  constructor(private readonly clients: SignalClients<T>) {
  }

  on<K extends keyof T>(name: K, fn: T[K]): () => void {
    return this.onOrdered(name, 0, fn);
  }

  onOrdered<K extends keyof T>(name: K, order: number, fn: T[K]): () => void {
    let xx = this.clients[name];
    if (!xx) {
      xx = this.clients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#off(name, fn);
  }

  #off<K extends keyof T>(name: K, fn: T[K]): void {
    const xx = this.clients[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }
}
