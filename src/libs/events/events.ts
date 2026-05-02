type Events = {
  // deno-lint-ignore no-explicit-any
  [_: string]: (..._: any[]) => any;
};

export type Clients<A extends Events> = {
  [E in keyof A]?: {
    fn: A[E];
    order: number;
  }[];
};

export class Emitter<A extends Events, B extends Events> {
  constructor(
    private readonly clients: Clients<A>,
    private readonly syncClients: Clients<B>,
  ) {
  }

  async emit<E extends keyof A>(
    event: E,
    ...args: Parameters<A[E]>
  ): Promise<void> {
    for (const { fn } of this.clients[event] ?? []) {
      await fn(...args);
    }
  }

  emitSync<E extends keyof B>(
    event: E,
    ...args: Parameters<B[E]>
  ): void {
    for (const { fn } of this.syncClients[event] ?? []) {
      fn(...args);
    }
  }
}

export class Listener<A extends Events, B extends Events> {
  constructor(
    private readonly clients: Clients<A>,
    private readonly syncClients: Clients<B>,
  ) {
  }

  on<E extends keyof A>(event: E, fn: A[E], order = 0): void {
    let clients = this.clients[event];
    if (!clients) {
      clients = this.clients[event] = [];
    }
    clients.push({ fn, order });
    clients.sort((a, b) => a.order - b.order);
  }

  off<E extends keyof A>(event: E, fn: A[E]): void {
    const clients = this.clients[event];
    if (clients) {
      const i = clients.findIndex((x) => x.fn === fn);
      if (i >= 0) {
        clients.splice(i, 1);
      }
    }
  }

  onSync<E extends keyof B>(event: E, fn: B[E], order = 0): void {
    let clients = this.syncClients[event];
    if (!clients) {
      clients = this.syncClients[event] = [];
    }
    clients.push({ fn, order });
    clients.sort((a, b) => a.order - b.order);
  }

  offSync<E extends keyof B>(event: E, fn: B[E]): void {
    const clients = this.syncClients[event];
    if (clients) {
      const i = clients.findIndex((x) => x.fn === fn);
      if (i >= 0) {
        clients.splice(i, 1);
      }
    }
  }
}
