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

      if (x.fileOpen) {
        this.#fileOpen = x.fileOpen.bind(x);
      }

      if (x.fileSave) {
        this.#fileSave = x.fileSave.bind(x);
      }

      if (x.fileSaveAs) {
        this.#fileSaveAs = x.fileSaveAs.bind(x);
      }
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
      await x.onBeforeStop?.(e);
    }

    for (const x of this.plugins) {
      await x.onStop?.(e);
    }

    for (const x of this.plugins) {
      await x.onAfterStop?.(e);
    }
  }

  emitResize(): void {
    for (const x of this.plugins) {
      x.onResize?.();
    }
  }

  emitRender(): void {
    for (const x of this.plugins) {
      x.onBeforeRender?.();
    }

    for (const x of this.plugins) {
      x.onRender?.();
    }

    for (const x of this.plugins) {
      x.onAfterRender?.();
    }
  }

  emitDebugRender(elapsed: number): void {
    for (const x of this.plugins) {
      x.onDebugRender?.(elapsed);
    }
  }

  emitDebugKey(elapsed: number): void {
    for (const x of this.plugins) {
      x.onDebugKey?.(elapsed);
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

  #alert?: (_: string) => Promise<void>;
  #ask?: (_: string) => Promise<boolean>;
  #askFileName?: (_: string) => Promise<string | undefined>;
  #fileOpen?: (_: string) => Promise<void>;
  #fileSave?: () => Promise<boolean>;
  #fileSaveAs?: () => Promise<boolean>;

  async alert(message: string): Promise<void> {
    await this.#alert?.(message);
  }

  async ask(message: string): Promise<boolean> {
    return this.#ask?.(message) ?? false;
  }

  async askFileName(fileName: string): Promise<string | undefined> {
    return await this.#askFileName?.(fileName);
  }

  async fileOpen(fileName: string): Promise<void> {
    await this.#fileOpen?.(fileName);
  }

  async fileSave(): Promise<boolean> {
    return await this.#fileSave?.() ?? false;
  }

  async fileSaveAs(): Promise<boolean> {
    return await this.#fileSaveAs?.() ?? false;
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
