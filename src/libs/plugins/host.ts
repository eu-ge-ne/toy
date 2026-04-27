import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Plugin } from "./plugin.ts";

export class Host {
  readonly plugins: Plugin[] = [];

  alert!: Alert;
  ask!: Ask;
  askFileName!: AskFileName;
  files!: Files;

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
  save(): Promise<boolean>;
  saveAs(): Promise<boolean>;
}
