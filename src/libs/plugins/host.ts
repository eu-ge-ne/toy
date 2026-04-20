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
    this.plugins.forEach((x) => x.onStart());
  }

  emitExit(e?: PromiseRejectionEvent): void {
    this.plugins.forEach((x) => x.onExit(e));
  }

  emitResize(): void {
    for (const x of this.plugins) {
      x.onResize();
    }
  }

  emitRender(): void {
    for (const x of this.plugins) {
      x.onPreRender();
    }

    for (const x of this.plugins) {
      x.onRender();
    }

    for (const x of this.plugins) {
      x.onPostRender();
    }
  }

  emitRendered(elapsed: number): void {
    for (const x of this.plugins) {
      x.onRendered(elapsed);
    }
  }

  async emitKey(key: kitty.Key): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onKey(key)) {
        return;
      }
    }
  }

  emitKeyHandled(elapsed: number): void {
    for (const x of this.plugins) {
      x.onKeyHandled(elapsed);
    }
  }

  async emitCommand(cmd: commands.Command): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onCommand(cmd)) {
        return;
      }
    }
  }

  emitDocNameChange(docName: string): void {
    for (const x of this.plugins) {
      x.onDocNameChange(docName);
    }
  }

  emitDocContentChange(): void {
    for (const x of this.plugins) {
      x.onDocContentChange();
    }
  }

  emitDocContentReset(): void {
    for (const x of this.plugins) {
      x.onDocContentReset();
    }
  }

  emitCursorChange(data: { ln: number; col: number; lnCount: number }): void {
    for (const x of this.plugins) {
      x.onCursorChange(data);
    }
  }
}
