import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export class PalettePlugin extends plugins.Plugin {
  #zen = true;

  readonly #widget = new PaletteWidget({
    onRender: () => {
      this.host.resize();
      this.host.render();
    },
  });

  constructor(host: plugins.Host) {
    super(host);

    host.onReact("resize", this.onResize);
  }

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    if (this.#zen) {
      this.#widget.resize(columns, rows, 0, 0);
    } else {
      this.#widget.resize(columns, rows - 2, 1, 0);
    }
  };

  override async onCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Zen":
        this.#zen = !this.#zen;
        this.host.resize();
        return;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return;

      case "Palette":
        await this.#run();
        return;
    }
  }

  async #run(): Promise<void> {
    const cmd = await this.#widget.open();

    this.host.render();

    if (cmd) {
      await this.host.emitCommand(cmd);
    }
  }
}
