import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as vt from "@libs/vt";

import { Plugin } from "@libs/plugins";
import { Alert, Api, Ask, AskFileName, Doc, Files } from "./api.ts";
import { InterceptorEvents, ReactorEvents } from "./events.ts";

export class Host extends events.Listener<InterceptorEvents, ReactorEvents>
  implements Api {
  private readonly emitter: events.Emitter<InterceptorEvents, ReactorEvents>;

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor() {
    const clients = new events.Clients<InterceptorEvents, ReactorEvents>();

    super(clients);

    this.emitter = new events.Emitter<InterceptorEvents, ReactorEvents>(
      clients,
    );
  }

  registerFiles(plugin: Files): void {
    this.files = plugin;
  }

  registerDoc(plugin: Doc): void {
    this.doc = plugin;
  }

  register(plugin: Plugin): void {
    plugin.register(this);

    if (plugin.registerAlert) {
      this.alert = plugin.registerAlert(this);
    }

    if (plugin.registerAsk) {
      this.ask = plugin.registerAsk(this);
    }

    if (plugin.registerAskFileName) {
      this.askFileName = plugin.registerAskFileName(this);
    }

    if (plugin.registerDoc) {
      this.doc = plugin.registerDoc(this);
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

    this.debugRender(performance.now() - t0);
  }

  async loop(
    iter: (_: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void> {
    const ctx = { continue: true, layoutChanged: true };

    while (ctx.continue) {
      if (ctx.layoutChanged) {
        this.resize();
        ctx.layoutChanged = false;
      }

      this.render();

      const key = await vt.readKey();

      await this.emitter.intercept("key.press", { key });

      iter(ctx);
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

  debugRender(elapsed: number): void {
    this.emitter.react("debug.render", elapsed);
  }

  debugInput(elapsed: number): void {
    this.emitter.react("debug.input", elapsed);
  }

  statusDocName(name: string): void {
    this.emitter.react("status.doc.name", name);
  }

  statusDocModified(modified: boolean, lineCount: number): void {
    this.emitter.react("status.doc.modified", { modified, lineCount });
  }

  statusDocCursor(ln: number, col: number): void {
    this.emitter.react("status.doc.cursor", { ln, col });
  }
}
