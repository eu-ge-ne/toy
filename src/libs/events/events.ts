// deno-lint-ignore no-explicit-any
export type InterceptorEventData<T = Record<string, any>> =
  & { cancel?: boolean }
  & T;

// deno-lint-ignore no-explicit-any
type InterceptorEventDataBase = { cancel?: boolean } & Record<string, any>;

// deno-lint-ignore no-explicit-any
export type ReactorEventData<T = any> = T;

type SyncInterceptorEvents = {
  [key: string]: (data: InterceptorEventDataBase) => void;
};

type AsyncInterceptorEvents = {
  [key: string]: (data: InterceptorEventDataBase) => Promise<void>;
};

type ReactorEvents = {
  [key: string]: (data: ReactorEventData) => void | Promise<void>;
};

export type SyncInterceptors<Events extends SyncInterceptorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export type AsyncInterceptors<Events extends AsyncInterceptorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export type Reactors<Events extends ReactorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export class Emitter<
  A extends SyncInterceptorEvents,
  B extends AsyncInterceptorEvents,
  C extends ReactorEvents,
> {
  constructor(
    private readonly syncInterceptors: SyncInterceptors<A>,
    private readonly asyncInterceptors: AsyncInterceptors<B>,
    private readonly reactors: Reactors<C>,
  ) {
  }

  interceptSync<E extends keyof A>(name: E, data: Parameters<A[E]>[0]): void {
    const listeners = this.syncInterceptors[name];
    if (!listeners) {
      return;
    }

    for (const { fn } of listeners) {
      fn(data);
      if (data.cancel) {
        return;
      }
    }
  }

  async interceptAsync<E extends keyof B>(
    name: E,
    data: Parameters<B[E]>[0],
  ): Promise<void> {
    const listeners = this.asyncInterceptors[name];
    if (!listeners) {
      return;
    }

    for (const { fn } of listeners) {
      await fn(data);
      if (data.cancel) {
        return;
      }
    }
  }

  react<E extends keyof C>(name: E, data: Parameters<C[E]>[0]): void {
    const listeners = this.reactors[name];
    if (!listeners) {
      return;
    }

    for (const { fn } of listeners) {
      try {
        const result = fn(data);
        if (result instanceof Promise) {
          result.catch((err) => console.error(err));
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export class Listener<
  A extends SyncInterceptorEvents,
  B extends AsyncInterceptorEvents,
  C extends ReactorEvents,
> {
  constructor(
    private readonly syncInterceptors: SyncInterceptors<A>,
    private readonly asyncInterceptors: AsyncInterceptors<B>,
    private readonly reactors: Reactors<C>,
  ) {
  }

  onInterceptSync<E extends keyof A>(name: E, fn: A[E], order = 0): void {
    let listeners = this.syncInterceptors[name];
    if (!listeners) {
      listeners = this.syncInterceptors[name] = [];
    }
    listeners.push({ fn, order });
    listeners.sort((a, b) => a.order - b.order);
  }

  onInterceptAsync<E extends keyof B>(name: E, fn: B[E], order = 0): void {
    let listeners = this.asyncInterceptors[name];
    if (!listeners) {
      listeners = this.asyncInterceptors[name] = [];
    }
    listeners.push({ fn, order });
    listeners.sort((a, b) => a.order - b.order);
  }

  onReact<E extends keyof C>(name: E, fn: C[E], order = 0): void {
    let listeners = this.reactors[name];
    if (!listeners) {
      listeners = this.reactors[name] = [];
    }
    listeners.push({ fn, order });
    listeners.sort((a, b) => a.order - b.order);
  }

  offInterceptSync<E extends keyof A>(name: E, fn: A[E]): void {
    const listeners = this.syncInterceptors[name];
    if (!listeners) {
      return;
    }
    const i = listeners.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  }

  offInterceptAsync<E extends keyof B>(name: E, fn: B[E]): void {
    const listeners = this.asyncInterceptors[name];
    if (!listeners) {
      return;
    }
    const i = listeners.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  }

  offReact<E extends keyof C>(name: E, fn: C[E]): void {
    const listeners = this.reactors[name];
    if (!listeners) {
      return;
    }
    const i = listeners.findIndex((x) => x.fn === fn);
    if (i >= 0) {
      listeners.splice(i, 1);
    }
  }
}
