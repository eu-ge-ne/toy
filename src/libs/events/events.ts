type Events = {
  [_: string]: (..._: unknown[]) => void;
};

export type Clients<A extends Events> = { [E in keyof A]?: A[E][] };

export class Emitter<A extends Events> {
  constructor(private readonly clients: Clients<A>) {
  }

  emit<E extends keyof A>(event: E, ...args: Parameters<A[E]>): this {
    for (const x of this.clients[event] ?? []) {
      x(...args);
    }
    return this;
  }
}

export class Listener<A extends Events> {
  constructor(private readonly clients: Clients<A>) {
  }

  on<E extends keyof A>(event: E, listener: A[E]): this {
    let clients = this.clients[event];
    if (!clients) {
      clients = this.clients[event] = [];
    }
    clients.push(listener);
    return this;
  }

  off<E extends keyof A>(event: E, listener: A[E]): this {
    const clients = this.clients[event];
    if (clients) {
      const i = clients.indexOf(listener);
      if (i >= 0) {
        clients.splice(i, 1);
      }
    }
    return this;
  }
}
