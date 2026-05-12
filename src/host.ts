import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";

export class Host
  extends events.Listener<api.InterceptorEvents, api.ReactorEvents>
  implements api.Api {
  private readonly emitter: events.Emitter<
    api.InterceptorEvents,
    api.ReactorEvents
  >;

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

  constructor() {
    const clients = new events.Clients<
      api.InterceptorEvents,
      api.ReactorEvents
    >();

    super(clients);

    this.emitter = new events.Emitter<
      api.InterceptorEvents,
      api.ReactorEvents
    >(clients);
  }

  register(plugin: plugins.Plugin): void {
    this.#plugins.push(plugin);

    if (plugin.ioApi) {
      this.io = plugin.ioApi(this);
    }

    if (plugin.debugApi) {
      this.debug = plugin.debugApi(this);
    }

    if (plugin.cursorApi) {
      this.cursor = plugin.cursorApi(this);
    }

    if (plugin.docApi) {
      this.doc = plugin.docApi(this);
    }

    if (plugin.themeApi) {
      this.theme = plugin.themeApi(this);
    }

    if (plugin.zenApi) {
      this.zen = plugin.zenApi(this);
    }

    if (plugin.aboutApi) {
      this.about = plugin.aboutApi(this);
    }

    if (plugin.alertModalApi) {
      this.alertModal = plugin.alertModalApi(this);
    }

    if (plugin.confirmModalApi) {
      this.confirmModal = plugin.confirmModalApi(this);
    }

    if (plugin.fileNameModalApi) {
      this.fileNameModal = plugin.fileNameModalApi(this);
    }

    if (plugin.paletteModalApi) {
      this.paletteModal = plugin.paletteModalApi(this);
    }
  }

  start(): void {
    for (const plugin of this.#plugins) {
      plugin.start?.(this);
    }
  }

  async emitStop(e?: PromiseRejectionEvent): Promise<void> {
    await this.emitter.intercept("stop", { e });
  }
}
