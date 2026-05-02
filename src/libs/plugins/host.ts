import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

import { Events, SyncEvents } from "./events.ts";
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

export class Host extends events.Listener<Events, SyncEvents> {
  readonly #emitter: events.Emitter<Events, SyncEvents>;

  readonly plugins: Plugin[] = [];

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor() {
    const clients: events.Clients<Events> = {};
    const syncClients: events.Clients<SyncEvents> = {};
    super(clients, syncClients);

    this.#emitter = new events.Emitter<Events, SyncEvents>(
      clients,
      syncClients,
    );
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
      await x.onCommand?.(cmd);
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

  debugVersion(version: string): void {
    this.#emitter.emitSync("debug.version", version);
  }

  debugRender(elapsed: number): void {
    this.#emitter.emitSync("debug.render", elapsed);
  }

  debugInput(elapsed: number): void {
    this.#emitter.emitSync("debug.input", elapsed);
  }

  statusDocName(name: string): void {
    this.#emitter.emitSync("status.doc.name", name);
  }

  statusDocModified(modified: boolean, lineCount: number): void {
    this.#emitter.emitSync("status.doc.modified", modified, lineCount);
  }

  statusDocCursor(ln: number, col: number): void {
    this.#emitter.emitSync("status.doc.cursor", ln, col);
  }
}
