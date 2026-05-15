import { Clients } from "./clients.ts";
import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export class Listener<T extends Events | Signals> {
  constructor(private readonly clients: Clients<T>) {
  }

  on<K extends keyof T>(name: K, order = 0): (_: T[K]) => () => void {
    return (fn: T[K]) => {
      let xx = this.clients[name];
      if (!xx) {
        xx = this.clients[name] = [];
      }

      xx.push({ fn, order });
      xx.sort((a, b) => a.order - b.order);

      return () => this.#off(name, fn);
    };
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
