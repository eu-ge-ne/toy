import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

export class Host implements api.Toy {
  #plugins: plugins.Plugin[] = [];

  about!: api.About;
  alertModal!: api.AlertModal;
  confirmModal!: api.ConfirmModal;
  cursor!: api.Cursor;
  debug!: api.Debug;
  doc!: api.Doc;
  fileNameModal!: api.FileNameModal;
  io!: api.IO;
  paletteModal!: api.PaletteModal;
  runtime!: api.Runtime;
  theme!: api.Theme;
  zen!: api.Zen;

  init(): void {
    for (const plugin of this.#plugins) {
      plugin.init?.(this);
    }
  }

  register(plugin: plugins.Plugin): void {
    this.#plugins.push(plugin);

    // deno-lint-ignore no-explicit-any
    const t = this as any;
    for (const [apiName, apiFn] of Object.entries(plugin.register ?? {})) {
      if (t[apiName]) {
        throw new Error("API coflict");
      }
      t[apiName] = apiFn(this);
    }
  }
}
