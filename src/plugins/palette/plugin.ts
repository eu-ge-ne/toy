import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export class PalettePlugin extends plugins.Plugin {
  protected name = "Palette";

  #zen = true;

  readonly #widget = new PaletteWidget({
    onInvalidate: () => {
      this.host.emitResize();
      this.host.emitRender();
    },
  });

  override onResize(): void {
    const { columns, rows } = Deno.consoleSize();

    if (this.#zen) {
      this.#widget.resize(columns, rows, 0, 0);
    } else {
      this.#widget.resize(columns, rows - 2, 1, 0);
    }
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#zen = !this.#zen;
        this.host.emitResize();
        return false;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;

      case "Palette":
        await this.#run();
        return true;
    }

    return false;
  }

  async #run(): Promise<void> {
    const cmd = await this.#widget.open();

    this.host.emitRender();

    if (cmd) {
      await this.host.emitCommand(cmd);
    }
  }
}
