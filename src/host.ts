import * as api from "@libs/api";
import * as plugins from "@libs/plugins";

export class Host implements api.Host {
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

    if (plugin.initAbout) {
      this.about = plugin.initAbout(this);
    }

    if (plugin.initAlertModal) {
      this.alertModal = plugin.initAlertModal(this);
    }

    if (plugin.initConfirmModal) {
      this.confirmModal = plugin.initConfirmModal(this);
    }

    if (plugin.initCursor) {
      this.cursor = plugin.initCursor(this);
    }

    if (plugin.initDebug) {
      this.debug = plugin.initDebug(this);
    }

    if (plugin.initDoc) {
      this.doc = plugin.initDoc(this);
    }

    if (plugin.initFileNameModal) {
      this.fileNameModal = plugin.initFileNameModal(this);
    }

    if (plugin.initIO) {
      this.io = plugin.initIO(this);
    }

    if (plugin.initPaletteModal) {
      this.paletteModal = plugin.initPaletteModal(this);
    }

    if (plugin.initRuntime) {
      this.runtime = plugin.initRuntime(this);
    }

    if (plugin.initTheme) {
      this.theme = plugin.initTheme(this);
    }

    if (plugin.initZen) {
      this.zen = plugin.initZen(this);
    }
  }
}
