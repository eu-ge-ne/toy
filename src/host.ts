import * as api from "@libs/api";
import * as events from "@libs/events";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

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
  alertModal!: api.AlertModalApi;
  confirmModal!: api.ConfirmModalApi;
  fileNameModal!: api.FileNameModalApi;
  paletteModal!: api.PaletteModalApi;

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
    plugin.init?.(this);

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

  async emitStart(data: { version: string }): Promise<void> {
    await this.emitter.intercept("start", data);
  }

  async emitStop(e?: PromiseRejectionEvent): Promise<void> {
    await this.emitter.intercept("stop", { e });
  }

  emitToggleZen(): void {
    this.emitter.react("zen.toggle");
  }

  emitSetTheme(name: keyof typeof themes.Themes): void {
    this.emitter.react("theme.set", name);
  }
}
