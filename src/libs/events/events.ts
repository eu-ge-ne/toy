type Events = {
  [_: string]: (..._: unknown[]) => void;
};

export class EventEmitter<A extends Events> {
  #listeners: { [E in keyof A]?: A[E][] } = {};

  emit<E extends keyof A>(event: E, ...args: Parameters<A[E]>): this {
    for (const x of this.#listeners[event] ?? []) {
      x(...args);
    }
    return this;
  }

  on<E extends keyof A>(event: E, listener: A[E]): this {
    let x = this.#listeners[event];
    if (!x) {
      x = this.#listeners[event] = [];
    }
    x.push(listener);
    return this;
  }

  off<E extends keyof A>(event: E, listener: A[E]): this {
    const x = this.#listeners[event];
    if (x) {
      const i = x.indexOf(listener);
      if (i >= 0) {
        x.splice(i, 1);
      }
    }
    return this;
  }
}
