import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as themes from "@libs/themes";

import { Plugin } from "./plugin.ts";

export abstract class Host {
  protected readonly plugins: Plugin[] = [];

  register(...plugins: Plugin[]): void {
    this.plugins.push(...plugins);
  }

  abstract resize(): void;
  abstract render(): void;
  abstract zen(): Promise<void>;
  abstract exit(): Promise<void>;
  abstract palette(): Promise<void>;
  abstract save(): Promise<void>;
  abstract theme(_: themes.Theme): Promise<void>;

  emitStart(): void {
    this.plugins.forEach((x) => x.onStart());
  }

  emitExit(e?: PromiseRejectionEvent): void {
    this.plugins.forEach((x) => x.onExit(e));
  }

  emitRender(): void {
    this.plugins.forEach((x) => x.onRender());
  }

  async emitKey(key: kitty.Key): Promise<void> {
    for (const plugin of this.plugins) {
      if (await plugin.onKey(key)) {
        return;
      }
    }
  }

  async emitCommand(cmd: commands.Command): Promise<void> {
    for (const plugin of this.plugins) {
      if (await plugin.onCommand(cmd)) {
        return;
      }
    }
  }
}
