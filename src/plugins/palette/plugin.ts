import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export class PalettePlugin extends plugins.Plugin {
  readonly widget = new PaletteWidget({
    onInvalidate: () => {
      this.host.emitResize();
      this.host.render();
    },
  });

  override onResize(): void {
    const { columns, rows } = Deno.consoleSize();

    this.widget.resize(columns, rows, 0, 0);
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;

      case "Palette":
        await this.#run();
        return true;
    }

    return false;
  }

  async #run(): Promise<void> {
    const cmd = await this.widget.open();

    this.host.render();

    if (cmd) {
      await this.host.emitCommand(cmd);
    }
  }
}
