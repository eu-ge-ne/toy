import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Plugin } from "./plugin.ts";

export class Host {
  protected readonly plugins: Plugin[] = [];

  register(...plugins: Plugin[]): void {
    for (const x of plugins) {
      if (x.alert) {
        this.#alert = x.alert.bind(x);
      }

      if (x.ask) {
        this.#ask = x.ask.bind(x);
      }

      if (x.askFileName) {
        this.#askFileName = x.askFileName.bind(x);
      }

      x.register?.({
        setFileOpenHandler: (x) => this.#fileOpen = x,
        setFileSaveHandler: (x) => this.#fileSave = x,
        setFileSaveAsHandler: (x) => this.#fileSaveAs = x,
      });
    }

    this.plugins.push(...plugins);
  }

  async emitStart(): Promise<void> {
    for (const x of this.plugins) {
      await x.onStart?.();
    }
  }

  async emitStop(e?: PromiseRejectionEvent): Promise<void> {
    for (const x of this.plugins) {
      await x.onPreStop?.(e);
    }

    for (const x of this.plugins) {
      await x.onStop?.(e);
    }

    for (const x of this.plugins) {
      await x.onPostStop?.(e);
    }
  }

  emitResize(): void {
    for (const x of this.plugins) {
      x.onResize?.();
    }
  }

  emitRender(): void {
    for (const x of this.plugins) {
      x.onPreRender?.();
    }

    for (const x of this.plugins) {
      x.onRender?.();
    }

    for (const x of this.plugins) {
      x.onPostRender?.();
    }
  }

  emitRendered(elapsed: number): void {
    for (const x of this.plugins) {
      x.onRendered?.(elapsed);
    }
  }

  #alert?: (_: string) => Promise<void>;

  async alert(message: string): Promise<void> {
    await this.#alert?.(message);
  }

  #ask?: (_: string) => Promise<boolean>;

  async ask(message: string): Promise<boolean> {
    return this.#ask?.(message) ?? false;
  }

  #askFileName?: (_: string) => Promise<string | undefined>;

  async askFileName(fileName: string): Promise<string | undefined> {
    return await this.#askFileName?.(fileName);
  }

  #fileOpen?: (_: string) => Promise<void>;
  #fileSave?: () => Promise<boolean>;
  #fileSaveAs?: () => Promise<boolean>;

  async fileOpen(fileName: string): Promise<void> {
    await this.#fileOpen?.(fileName);
  }

  async fileSave(): Promise<boolean> {
    return await this.#fileSave?.() ?? false;
  }

  async fileSaveAs(): Promise<boolean> {
    return await this.#fileSaveAs?.() ?? false;
  }

  async emitCommand(cmd: commands.Command): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onCommand?.(cmd)) {
        return;
      }
    }
  }

  async emitKey(key: kitty.Key): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onKey?.(key)) {
        return;
      }
    }
  }

  emitKeyHandled(elapsed: number): void {
    for (const x of this.plugins) {
      x.onKeyHandled?.(elapsed);
    }
  }

  emitDocWrite(chunk: string): void {
    for (const x of this.plugins) {
      x.onDocWrite?.(chunk);
    }
  }

  emitDocRead(): Iterable<string> {
    for (const x of this.plugins) {
      if (x.onDocRead) {
        return x.onDocRead();
      }
    }
    return Iterator.from([]);
  }

  async emitDocSave(): Promise<void> {
    for (const x of this.plugins) {
      x.onDocSave?.();
    }
  }

  emitDocReset(): void {
    for (const x of this.plugins) {
      x.onDocReset?.();
    }
  }

  emitDocChange(): void {
    for (const x of this.plugins) {
      x.onDocChange?.();
    }
  }

  emitDocNameChange(docName: string): void {
    for (const x of this.plugins) {
      x.onDocNameChange?.(docName);
    }
  }

  emitDocCursorChange(ln: number, col: number, lnCount: number): void {
    for (const x of this.plugins) {
      x.onDocCursorChange?.(ln, col, lnCount);
    }
  }
}
