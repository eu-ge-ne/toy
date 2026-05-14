import { EventClients, SignalClients } from "./clients.ts";
import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export class Listener<EE extends Events, NN extends Signals> {
  constructor(
    private readonly eventClients: EventClients<EE>,
    private readonly signalClients: SignalClients<NN>,
  ) {
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
    let xx = this.eventClients[name];
    if (!xx) {
      xx = this.eventClients[name] = [];
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
    let xx = this.signalClients[name];
    if (!xx) {
      xx = this.signalClients[name] = [];
    }

    xx.push({ fn, order });
    xx.sort((a, b) => a.order - b.order);

    return () => this.#offReact(name, fn);
  }

  #offIntercept<E extends keyof EE>(name: E, fn: EE[E]): void {
    const xx = this.eventClients[name];
    if (!xx) {
      return;
    }

    const i = xx.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      xx.splice(i, 1);
    }
  }

  #offReact<N extends keyof NN>(name: N, fn: NN[N]): void {
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
