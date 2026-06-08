import * as alertModal from "@libs/alert-modal";
import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as confirmModal from "@libs/confirm-modal";
import * as debug from "@libs/debug";
import * as fileNameModal from "@libs/file-name-modal";
import * as footer from "@libs/footer";
import * as header from "@libs/header";
import * as io from "@libs/io";
import * as paletteModal from "@libs/palette-modal";
import * as plugins from "@libs/plugins";
import * as runtime from "@libs/runtime";
import * as shortcuts from "@libs/shortcuts";
import * as themes from "@libs/themes";
import * as views from "@libs/views";
import * as zen from "@libs/zen";

const userPlugins: string[] = [];

export class Toy extends api.Toy {
  #plugins: plugins.Plugin[] = [];

  private constructor() {
    super();
  }

  static async load(): Promise<Toy> {
    const toy = new Toy();

    toy.#register(alertModal.plugin);
    toy.#register(buffers.plugin);
    toy.#register(confirmModal.plugin);
    toy.#register(debug.plugin);
    toy.#register(fileNameModal.plugin);
    toy.#register(footer.plugin);
    toy.#register(header.plugin);
    toy.#register(io.plugin);
    toy.#register(paletteModal.plugin);
    toy.#register(runtime.plugin);
    toy.#register(shortcuts.plugin);
    toy.#register(themes.plugin);
    toy.#register(views.plugin);
    toy.#register(zen.plugin);

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
