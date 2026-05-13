import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

export class Host implements api.Host {
  about!: api.About;
  runtime!: api.RuntimeAPI;
  io!: api.IOAPI;
  debug!: api.DebugAPI;
  doc!: api.DocAPI;
  cursor!: api.CursorAPI;
  theme!: api.ThemeAPI;
  zen!: api.ZenAPI;
  alertModal!: api.AlertModalAPI;
  confirmModal!: api.ConfirmModalAPI;
  fileNameModal!: api.FileNameModalAPI;
  paletteModal!: api.PaletteModalAPI;

  #plugins: plugins.Plugin[] = [];

  register(plugin: plugins.Plugin): void {
    this.#plugins.push(plugin);

    if (plugin.initAbout) {
      this.about = plugin.initAbout(this);
    }

    if (plugin.initRuntime) {
      this.runtime = plugin.initRuntime(this);
    }

    if (plugin.initIO) {
      this.io = plugin.initIO(this);
    }

    if (plugin.initDebug) {
      this.debug = plugin.initDebug(this);
    }

    if (plugin.initCursor) {
      this.cursor = plugin.initCursor(this);
    }

    if (plugin.initDoc) {
      this.doc = plugin.initDoc(this);
    }

    if (plugin.initTheme) {
      this.theme = plugin.initTheme(this);
    }

    if (plugin.initZen) {
      this.zen = plugin.initZen(this);
    }

    if (plugin.initAlertModal) {
      this.alertModal = plugin.initAlertModal(this);
    }

    if (plugin.initConfirmModal) {
      this.confirmModal = plugin.initConfirmModal(this);
    }

    if (plugin.initFileNameModal) {
      this.fileNameModal = plugin.initFileNameModal(this);
    }

    if (plugin.initPaletteModal) {
      this.paletteModal = plugin.initPaletteModal(this);
    }
  }

  init(): void {
    for (const plugin of this.#plugins) {
      plugin.init?.(this);
    }
  }
}
