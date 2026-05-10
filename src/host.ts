import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";

export class Host
  extends events.Listener<plugins.InterceptorEvents, plugins.ReactorEvents>
  implements plugins.Api {
  private readonly emitter: events.Emitter<
    plugins.InterceptorEvents,
    plugins.ReactorEvents
  >;

  palette!: plugins.Palette;
  debug!: plugins.Debug;
  alert!: plugins.Alert;
  ask!: plugins.Ask;
  askFileName!: plugins.AskFileName;
  files!: plugins.Files;
  doc!: plugins.Doc;

  constructor() {
    const clients = new events.Clients<
      plugins.InterceptorEvents,
      plugins.ReactorEvents
    >();

    super(clients);

    this.emitter = new events.Emitter<
      plugins.InterceptorEvents,
      plugins.ReactorEvents
    >(
      clients,
    );
  }

  register(plugin: plugins.Plugin): void {
    plugin.init?.(this);

    if (plugin.initPalette) {
      this.palette = plugin.initPalette(this);
    }

    if (plugin.initDebug) {
      this.debug = plugin.initDebug(this);
    }

    if (plugin.initAlert) {
      this.alert = plugin.initAlert(this);
    }

    if (plugin.initAsk) {
      this.ask = plugin.initAsk(this);
    }

    if (plugin.initAskFileName) {
      this.askFileName = plugin.initAskFileName(this);
    }

    if (plugin.initDoc) {
      this.doc = plugin.initDoc(this);
    }

    if (plugin.initFiles) {
      this.files = plugin.initFiles(this);
    }
  }

  resize(): void {
    this.emitter.react("resize");
  }

  render(): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    this.emitter.react("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    this.emitter.react("debug.render", performance.now() - t0);
  }

  async keyPress(key: kitty.Key): Promise<void> {
    const t0 = performance.now();

    await this.emitter.intercept("key.press", { key });

    this.emitter.react("debug.key.press", performance.now() - t0);
  }

  async runInputLoop(
    cb: (_: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void> {
    const ctx = { continue: true, layoutChanged: true };

    while (ctx.continue) {
      if (ctx.layoutChanged) {
        this.resize();
        ctx.layoutChanged = false;
      }

      this.render();

      const key = await vt.readKey();
      await this.keyPress(key);

      cb(ctx);
    }
  }

  async emitStart(data: { version: string }): Promise<void> {
    await this.emitter.intercept("start", data);
  }

  async emitStop(e?: PromiseRejectionEvent): Promise<void> {
    await this.emitter.intercept("stop", { e });
  }

  async emitCommand(cmd: commands.Command): Promise<void> {
    await this.emitter.intercept("command", { cmd });
  }

  emitToggleZen(): void {
    this.emitter.react("zen.toggle");
  }

  emitSetTheme(name: keyof typeof themes.Themes): void {
    this.emitter.react("theme.set", name);
  }

  emitStatusDocName(name: string): void {
    this.emitter.react("status.doc.name", name);
  }

  emitStatusDocModified(modified: boolean, lineCount: number): void {
    this.emitter.react("status.doc.modified", { modified, lineCount });
  }

  emitStatusDocCursor(ln: number, col: number): void {
    this.emitter.react("status.doc.cursor", { ln, col });
  }
}
