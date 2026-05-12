import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

export class Host implements api.Api {
  runtime!: api.RuntimeApi;
  io!: api.IOApi;
  debug!: api.DebugApi;
  doc!: api.DocApi;
  cursor!: api.CursorApi;
  theme!: api.ThemeApi;
  zen!: api.ZenApi;
  about!: api.AboutApi;
  alertModal!: api.AlertModalApi;
  confirmModal!: api.ConfirmModalApi;
  fileNameModal!: api.FileNameModalApi;
  paletteModal!: api.PaletteModalApi;

  #plugins: plugins.Plugin[] = [];

  register(plugin: plugins.Plugin): void {
    this.#plugins.push(plugin);

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

    if (plugin.initAbout) {
      this.about = plugin.initAbout(this);
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
