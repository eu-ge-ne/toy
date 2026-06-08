import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as io from "@libs/io";
import * as plugins from "@libs/plugins";
import * as runtime from "@libs/runtime";
import * as themes from "@libs/themes";
import * as views from "@libs/views";
import alertModal from "@plugins/alert-modal";
import confirmModal from "@plugins/confirm-modal";
import debug from "@plugins/debug";
import fileNameModal from "@plugins/file-name-modal";
import footer from "@plugins/footer";
import header from "@plugins/header";
import paletteModal from "@plugins/palette-modal";
import shortcuts from "@plugins/shortcuts";
import zen from "@plugins/zen";

const userPlugins: string[] = [];

export class Toy extends api.Toy {
  #plugins: plugins.Plugin[] = [];

  private constructor() {
    super();
  }

  static async load(): Promise<Toy> {
    const toy = new Toy();

    toy.#register(alertModal);
    toy.#register(buffers.plugin);
    toy.#register(confirmModal);
    toy.#register(debug);
    toy.#register(fileNameModal);
    toy.#register(footer);
    toy.#register(header);
    toy.#register(io.plugin);
    toy.#register(paletteModal);
    toy.#register(runtime.plugin);
    toy.#register(shortcuts);
    toy.#register(themes.plugin);
    toy.#register(views.plugin);
    toy.#register(zen);

    await toy.#loadUserPlugins();

    return toy;
  }

  async #loadUserPlugins(): Promise<void> {
    await Promise.all(userPlugins.map(async (x) => this.#register((await import(x)).default)));

    for (const plugin of this.#plugins) {
      plugin.init?.(this);
    }
  }

  #register(plugin: plugins.Plugin): void {
    this.#plugins.push(plugin);

    // deno-lint-ignore no-explicit-any
    const rawThis = this as any;

    for (const [apiName, apiFn] of Object.entries(plugin.register ?? {})) {
      if (rawThis[apiName]) {
        throw new Error("API conflict");
      }
      rawThis[apiName] = apiFn(this);
    }
  }
}
