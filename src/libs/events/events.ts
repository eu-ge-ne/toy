// deno-lint-ignore no-explicit-any
type AnyArgs = any[];

type EventMap = {
  [_: string]: (...args: AnyArgs) => void | Promise<void>;
};

export type AsyncClients<A extends EventMap> = {
  [E in keyof A]?: { fn: A[E]; order: number }[];
};

export type SyncClients<A extends EventMap> = {
  [E in keyof A]?: { fn: A[E]; order: number }[];
};

export class Emitter<A extends EventMap, B extends EventMap> {
  constructor(
    private readonly asyncClients: AsyncClients<A>,
    private readonly syncClients: SyncClients<B>,
  ) {
  }

  async emit<E extends keyof A>(
    name: E,
    ...args: Parameters<A[E]>
  ): Promise<void> {
    for (const { fn } of this.asyncClients[name] ?? []) {
      await fn(...args);
    }
  }

  emitSync<E extends keyof B>(
    name: E,
    ...args: Parameters<B[E]>
  ): void {
    for (const { fn } of this.syncClients[name] ?? []) {
      fn(...args);
    }
  }
}

export class Listener<A extends EventMap, B extends EventMap> {
  constructor(
    private readonly asyncClients: AsyncClients<A>,
    private readonly syncClients: SyncClients<B>,
  ) {
  }

  on<E extends keyof A>(name: E, fn: A[E], order = 0): void {
    let clients = this.asyncClients[name];
    if (!clients) {
      clients = this.asyncClients[name] = [];
    }
    clients.push({ fn, order });
    clients.sort((a, b) => a.order - b.order);
  }

  off<E extends keyof A>(name: E, fn: A[E]): void {
    const clients = this.asyncClients[name];
    if (clients) {
      const i = clients.findIndex((x) => x.fn === fn);
      if (i >= 0) {
        clients.splice(i, 1);
      }
    }
  }

  onSync<E extends keyof B>(name: E, fn: B[E], order = 0): void {
    let clients = this.syncClients[name];
    if (!clients) {
      clients = this.syncClients[name] = [];
    }
    clients.push({ fn, order });
    clients.sort((a, b) => a.order - b.order);
  }

  offSync<E extends keyof B>(name: E, fn: B[E]): void {
    const clients = this.syncClients[name];
    if (clients) {
      const i = clients.findIndex((x) => x.fn === fn);
      if (i >= 0) {
        clients.splice(i, 1);
      }
    }
  }
}
