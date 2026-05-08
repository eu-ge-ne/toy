import { Clients } from "./clients.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";

export class Listener<IE extends InterceptorEvents, RE extends ReactorEvents> {
  constructor(private readonly clients: Clients<IE, RE>) {
  }

  onIntercept<E extends keyof IE>(name: E, fn: IE[E], order = 0): void {
    let xx = this.clients.Interceptors[name];
    if (!xx) {
      xx = this.clients.Interceptors[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);
  }

  onReact<E extends keyof RE>(name: E, fn: RE[E], order = 0): void {
    let xx = this.clients.Reactors[name];
    if (!xx) {
      xx = this.clients.Reactors[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);
  }

  offIntercept<E extends keyof IE>(name: E, fn: IE[E]): void {
    const xx = this.clients.Interceptors[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }

  offReact<E extends keyof RE>(name: E, fn: RE[E]): void {
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
