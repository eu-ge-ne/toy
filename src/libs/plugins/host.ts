import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Plugin } from "./plugin.ts";

export abstract class Host {
  protected readonly plugins: Plugin[] = [];

  register(...plugins: Plugin[]): void {
    this.plugins.push(...plugins);
  }

  abstract exit(): Promise<void>;
  abstract save(): Promise<void>;

  emitStart(): void {
    for (const x of this.plugins) {
      x.onStart?.();
    }
  }

  emitStop(e?: PromiseRejectionEvent): void {
    for (const x of this.plugins) {
      x.onStop?.(e);
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

  async emitAlert(message: string): Promise<void> {
    for (const x of this.plugins) {
      await x.onAlert?.(message);
    }
  }

  async emitAsk(message: string): Promise<boolean> {
    for (const x of this.plugins) {
      if (await x.onAsk?.(message)) {
        return true;
      }
    }
    return false;
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
