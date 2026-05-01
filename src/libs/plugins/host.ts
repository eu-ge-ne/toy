import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

import { DebugData, Plugin, StatusData } from "./plugin.ts";

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
  resize: () => void;
  beforeRender: () => void;
  render: () => void;
  afterRender: () => void;
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

  async emitStart(): Promise<void> {
    for (const x of this.plugins) {
      await x.onStart?.();
    }
  }

  async emitStop(e?: PromiseRejectionEvent): Promise<void> {
    for (const x of this.plugins) {
      await x.onStopBefore?.(e);
    }

    for (const x of this.plugins) {
      await x.onStop?.(e);
    }

    for (const x of this.plugins) {
      await x.onStopAfter?.(e);
    }
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

  emitDebug(data: DebugData): void {
    for (const x of this.plugins) {
      x.onDebug?.(data);
    }
  }

  emitStatus(data: StatusData): void {
    for (const x of this.plugins) {
      x.onStatus?.(data);
    }
  }

  resize(): void {
    this.#emitter.emit("resize");
  }

  render(): void {
    this.#emitter.emit("beforeRender");
    this.#emitter.emit("render");
    this.#emitter.emit("afterRender");
  }
}
