import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

const paths = [
  "@plugins/about",
  "@plugins/alert-modal",
  "@plugins/confirm-modal",
  "@plugins/debug",
  "@plugins/doc",
  "@plugins/file-name-modal",
  "@plugins/footer",
  "@plugins/header",
  "@plugins/io",
  "@plugins/palette-modal",
  "@plugins/runtime",
  "@plugins/shortcuts",
  "@plugins/theme",
  "@plugins/zen",
];

export class Toy extends api.Toy {
  #plugins: plugins.Plugin[] = [];

  async load(): Promise<void> {
    // deno-lint-ignore no-explicit-any
    const rawThis = this as any;

    await Promise.all(paths.map(async (x) => {
      const plugin = (await import(x)).default as plugins.Plugin;

      this.#plugins.push(plugin);

      for (const [apiName, apiFn] of Object.entries(plugin.register ?? {})) {
        if (rawThis[apiName]) {
          throw new Error("API conflict");
        }
        rawThis[apiName] = apiFn(this);
      }
    }));
  }

  init(): void {
    for (const plugin of this.#plugins) {
      plugin.init?.(this);
    }
  }
}
