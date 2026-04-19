import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";

import { Plugin } from "./plugin.ts";

export abstract class Host {
  protected readonly plugins: Plugin[] = [];

  register(...plugins: Plugin[]): void {
    this.plugins.push(...plugins);
  }

  abstract handleRefresh(): void;
  abstract handleZen(): Promise<void>;
  abstract handleExit(): Promise<void>;
  abstract handlePalette(): Promise<void>;
  abstract handleSave(): Promise<void>;
  abstract handleTheme(_: themes.Theme): Promise<void>;
  abstract handleWhitespace(): Promise<void>;
  abstract handleWrap(): Promise<void>;
  abstract handleCopy(): Promise<void>;
  abstract handleCut(): Promise<void>;
  abstract handlePaste(): Promise<void>;
  abstract handleUndo(): Promise<void>;
  abstract handleRedo(): Promise<void>;
  abstract handleSelectAll(): Promise<void>;

  onStart(): void {
    this.plugins.forEach((x) => x.onStart());
  }

  onRender(): void {
    this.plugins.forEach((x) => x.onRender());
  }

  onExit(e?: PromiseRejectionEvent): void {
    this.plugins.forEach((x) => x.onExit(e));
  }

  async onKey(key: kitty.Key): Promise<boolean> {
    for (const plugin of this.plugins) {
      if (await plugin.onKey(key)) {
        return true;
      }
    }

    return false;
  }

  async onCommand(cmd: commands.Command): Promise<boolean> {
    for (const plugin of this.plugins) {
      if (await plugin.onCommand(cmd)) {
        return true;
      }
    }

    return false;
  }
}
