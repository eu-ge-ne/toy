import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as vt from "@libs/vt";

import { InterceptorEvents, ReactorEvents } from "./events.ts";

export interface Alert {
  open(_: string): Promise<void>;
}

export interface Ask {
  open(_: string): Promise<boolean>;
}

export interface AskFileName {
  open(_: string): Promise<string | undefined>;
}

export interface Files {
  open(_: string): Promise<void>;
  save(): Promise<void>;
  saveAs(): Promise<void>;
}

export interface Doc {
  reset(): void;
  write(_: string): void;
  read(): Iterable<string>;
}

export class Host extends events.Listener<InterceptorEvents, ReactorEvents> {
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

    Deno.addSignalListener("SIGWINCH", () => {
      this.resize();
      this.#render();
    });
  }

  registerAlert(plugin: Alert): void {
    this.alert = plugin;
  }

  registerAsk(plugin: Ask): void {
    this.ask = plugin;
  }

  registerAskFileName(plugin: AskFileName): void {
    this.askFileName = plugin;
  }

  registerFiles(plugin: Files): void {
    this.files = plugin;
  }

  registerDoc(plugin: Doc): void {
    this.doc = plugin;
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

      this.#render();

      const key = await vt.readKey();

      await this.emitter.intercept("key.press", { key });

      iter(ctx);
    }
  }

  async start(data: { version: string }): Promise<void> {
    await this.emitter.intercept("start", data);
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.emitter.intercept("stop", { e });
  }

  async command(cmd: commands.Command): Promise<void> {
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

  resize(): void {
    this.emitter.react("resize");
  }

  #render(): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    this.emitter.react("render");

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    this.debugRender(performance.now() - t0);
  }
}
