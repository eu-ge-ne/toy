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

export class Emitter<A extends Events> {
  constructor(private readonly clients: Clients<A>) {
  }

  async emit<E extends keyof A>(
    event: E,
    ...args: Parameters<A[E]>
  ): Promise<void> {
    for (const { fn } of this.clients[event] ?? []) {
      await fn(...args);
    }
  }

  emitSync<E extends keyof A>(
    event: E,
    ...args: Parameters<A[E]>
  ): void {
    for (const { fn } of this.clients[event] ?? []) {
      fn(...args);
    }
  }
}

export class Listener<A extends Events> {
  constructor(private readonly clients: Clients<A>) {
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
}
