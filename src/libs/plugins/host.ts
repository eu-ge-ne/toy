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
  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor(
    clients: events.Clients<InterceptorEvents, ReactorEvents>,
    private readonly emitter: events.Emitter<InterceptorEvents, ReactorEvents>,
  ) {
    super(clients);
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

  async loop(running: () => boolean): Promise<void> {
    while (running()) {
      this.render();

      const key = await vt.readKey();

      await this.emitter.intercept("key.press", { key });
    }
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.emitter.intercept("stop", { e });
    await this.emitter.intercept("stop.after", { e });
  }

  async command(cmd: commands.Command): Promise<void> {
    await this.emitter.intercept("command", { cmd });
  }

  resize(): void {
    this.emitter.react("resize");
  }

  render(): void {
    this.emitter.react("render.before");
    this.emitter.react("render");
    this.emitter.react("render.after");
  }

  debugVersion(version: string): void {
    this.emitter.react("debug.version", version);
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
