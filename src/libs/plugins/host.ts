import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

import { Plugin, StatusData } from "./plugin.ts";

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

type HostEvents = {
  "start": () => void;
  "stop": (e?: PromiseRejectionEvent) => void;
  "stop.after": (e?: PromiseRejectionEvent) => void;
  "resize": () => void;
  "render.before": () => void;
  "render": () => void;
  "render.after": () => void;
  "debug.version": (_: string) => void;
  "debug.render": (_: number) => void;
  "debug.input": (_: number) => void;
};

export class Host extends events.Listener<HostEvents> {
  readonly #emitter: events.Emitter<HostEvents>;

  readonly plugins: Plugin[] = [];

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor() {
    const listeners: events.Clients<HostEvents> = {};
    super(listeners);

    this.#emitter = new events.Emitter<HostEvents>(listeners);
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

  emitStatus(data: StatusData): void {
    for (const x of this.plugins) {
      x.onStatus?.(data);
    }
  }

  start(): void {
    this.#emitter.emit("start");
  }

  stop(e?: PromiseRejectionEvent): void {
    this.#emitter.emit("stop", e);
    this.#emitter.emit("stop.after", e);
  }

  resize(): void {
    this.#emitter.emit("resize");
  }

  render(): void {
    this.#emitter.emit("render.before");
    this.#emitter.emit("render");
    this.#emitter.emit("render.after");
  }

  debugVersion(version: string): void {
    this.#emitter.emit("debug.version", version);
  }

  debugRender(elapsed: number): void {
    this.#emitter.emit("debug.render", elapsed);
  }

  debugInput(elapsed: number): void {
    this.#emitter.emit("debug.input", elapsed);
  }
}
