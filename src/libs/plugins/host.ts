import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

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
  readonly #emitter: events.Emitter<InterceptorEvents, ReactorEvents>;

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor() {
    const interceptors: events.Interceptors<InterceptorEvents> = {};
    const reactors: events.Reactors<ReactorEvents> = {};

    super(interceptors, reactors);

    this.#emitter = new events.Emitter<InterceptorEvents, ReactorEvents>(
      interceptors,
      reactors,
    );
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

  async start(): Promise<void> {
    await this.#emitter.intercept("start", {});
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.#emitter.intercept("stop", { e });
    await this.#emitter.intercept("stop.after", { e });
  }

  async keyPress(key: kitty.Key): Promise<void> {
    await this.#emitter.intercept("key.press", { key });
  }

  async command(cmd: commands.Command): Promise<void> {
    await this.#emitter.intercept("command", { cmd });
  }

  resize(): void {
    this.#emitter.react("resize");
  }

  render(): void {
    this.#emitter.react("render.before");
    this.#emitter.react("render");
    this.#emitter.react("render.after");
  }

  debugVersion(version: string): void {
    this.#emitter.react("debug.version", version);
  }

  debugRender(elapsed: number): void {
    this.#emitter.react("debug.render", elapsed);
  }

  debugInput(elapsed: number): void {
    this.#emitter.react("debug.input", elapsed);
  }

  statusDocName(name: string): void {
    this.#emitter.react("status.doc.name", name);
  }

  statusDocModified(modified: boolean, lineCount: number): void {
    this.#emitter.react("status.doc.modified", { modified, lineCount });
  }

  statusDocCursor(ln: number, col: number): void {
    this.#emitter.react("status.doc.cursor", { ln, col });
  }
}
