import * as commands from "@libs/commands";
import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

import {
  AsyncInterceptorEvents,
  ReactorEvents,
  SyncInterceptorEvents,
} from "./events.ts";
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

export class Host extends events.Listener<
  SyncInterceptorEvents,
  AsyncInterceptorEvents,
  ReactorEvents
> {
  readonly #emitter: events.Emitter<
    SyncInterceptorEvents,
    AsyncInterceptorEvents,
    ReactorEvents
  >;

  readonly plugins: Plugin[] = [];

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;
  doc!: Doc;

  constructor() {
    const syncInterceptors: events.SyncInterceptors<SyncInterceptorEvents> = {};
    const asyncInterceptors: events.AsyncInterceptors<AsyncInterceptorEvents> =
      {};
    const reactors: events.Reactors<ReactorEvents> = {};

    super(syncInterceptors, asyncInterceptors, reactors);

    this.#emitter = new events.Emitter<
      SyncInterceptorEvents,
      AsyncInterceptorEvents,
      ReactorEvents
    >(
      syncInterceptors,
      asyncInterceptors,
      reactors,
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
    await this.#emitter.interceptAsync("start", {});
  }

  async stop(e?: PromiseRejectionEvent): Promise<void> {
    await this.#emitter.interceptAsync("stop", { e });
    await this.#emitter.interceptAsync("stop.after", { e });
  }

  resize(): void {
    this.#emitter.react("resize", undefined);
  }

  render(): void {
    this.#emitter.react("render.before", undefined);
    this.#emitter.react("render", undefined);
    this.#emitter.react("render.after", undefined);
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
