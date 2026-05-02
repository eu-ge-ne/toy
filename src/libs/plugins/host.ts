import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

import { Events } from "./events.ts";
import { Plugin } from "./plugin.ts";

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

export class Host extends events.Listener<Events> {
  readonly #emitter: events.Emitter<Events>;

  readonly plugins: Plugin[] = [];

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor() {
    const listeners: events.Clients<Events> = {};
    super(listeners);

    this.#emitter = new events.Emitter<Events>(listeners);
  }

  register(...plugins: Plugin[]): void {
    this.plugins.push(...plugins);
  }

  registerAlert(plugin: Plugin & Alert): void {
    this.alert = plugin;
    this.plugins.push(plugin);
  }

  registerAsk(plugin: Plugin & Ask): void {
    this.ask = plugin;
    this.plugins.push(plugin);
  }

  registerAskFileName(plugin: Plugin & AskFileName): void {
    this.askFileName = plugin;
    this.plugins.push(plugin);
  }

  registerFiles(plugin: Plugin & Files): void {
    this.files = plugin;
    this.plugins.push(plugin);
  }

  registerDoc(plugin: Plugin & Doc): void {
    this.doc = plugin;
    this.plugins.push(plugin);
  }

  async emitKey(key: kitty.Key): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onKey?.(key)) {
        return;
      }
    }
  }

  async emitCommand(cmd: commands.Command): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onCommand?.(cmd)) {
        return;
      }
    }
  }

  async start(): Promise<void> {
    await this.#emitter.emit("start");
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.#emitter.emit("stop", e);
    await this.#emitter.emit("stop.after", e);
  }

  resize(): void {
    this.#emitter.emitSync("resize");
  }

  render(): void {
    this.#emitter.emitSync("render.before");
    this.#emitter.emitSync("render");
    this.#emitter.emitSync("render.after");
  }

  async debugVersion(version: string): Promise<void> {
    await this.#emitter.emit("debug.version", version);
  }

  async debugRender(elapsed: number): Promise<void> {
    await this.#emitter.emit("debug.render", elapsed);
  }

  async debugInput(elapsed: number): Promise<void> {
    await this.#emitter.emit("debug.input", elapsed);
  }

  async statusDocName(name: string): Promise<void> {
    await this.#emitter.emit("status.doc.name", name);
  }

  async statusDocModified(modified: boolean, lineCount: number): Promise<void> {
    await this.#emitter.emit("status.doc.modified", modified, lineCount);
  }

  async statusDocCursor(ln: number, col: number): Promise<void> {
    await this.#emitter.emit("status.doc.cursor", ln, col);
  }
}
