export class Loader<T0 extends Record<PropertyKey, never>> {
  readonly #api: T0;

  constructor(api?: T0) {
    this.#api = api ?? {} as T0;
  }

  use<T1>(plugin: (_: T0) => T1): Loader<T0 & T1> {
    Object.assign(this.#api, plugin(this.#api));

    return new Loader(this.#api as T0 & T1);
  }

  load(): T0 {
    return this.#api;
  }
}
