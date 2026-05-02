type Events = {
  // deno-lint-ignore no-explicit-any
  [_: string]: (..._: any[]) => any;
};

export type Clients<A extends Events> = { [E in keyof A]?: A[E][] };

export class Emitter<A extends Events> {
  constructor(private readonly clients: Clients<A>) {
  }

  emitSync<E extends keyof A>(
    event: E,
    ...args: Parameters<A[E]>
  ): void {
    for (const x of this.clients[event] ?? []) {
      x(...args);
    }
  }

  async emitAsync<E extends keyof A>(
    event: E,
    ...args: Parameters<A[E]>
  ): Promise<void> {
    for (const x of this.clients[event] ?? []) {
      await x(...args);
    }
  }
}

export class Listener<A extends Events> {
  constructor(private readonly clients: Clients<A>) {
  }

  on<E extends keyof A>(event: E, listener: A[E]): void {
    let clients = this.clients[event];
    if (!clients) {
      clients = this.clients[event] = [];
    }
    clients.push(listener);
  }

  off<E extends keyof A>(event: E, listener: A[E]): void {
    const clients = this.clients[event];
    if (clients) {
      const i = clients.indexOf(listener);
      if (i >= 0) {
        clients.splice(i, 1);
      }
    }
  }
}
