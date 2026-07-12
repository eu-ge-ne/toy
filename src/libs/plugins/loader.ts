export class Loader<API extends Record<PropertyKey, never>> {
  readonly #api: API;

  constructor(api = {} as API) {
    this.#api = api;
  }

  use<T>(plugin: (_: API) => T): Loader<API & T> {
    return new Loader(Object.assign(this.#api, plugin(this.#api)));
  }

  get api(): API {
    return this.#api;
  }
}
