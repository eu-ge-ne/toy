import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export class HeaderPlugin extends plugins.Plugin {
  #disabled = true;

  readonly #widget = new HeaderWidget({
    fileName: "",
    modified: false,
  });

  constructor(host: plugins.Host) {
    super(host);

    host.on("resize", this.onResize);
    host.on("render", this.onRender);
  }

  onResize = () => {
    const { columns } = Deno.consoleSize();

    this.#widget.resize(columns, 1, 0, 0);
  };

  onRender = () => {
    if (this.#disabled) {
      return;
    }
    this.#widget.render();
  };

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#disabled = !this.#disabled;
        this.host.resize();
        return false;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  override onStatus(data: plugins.StatusData): void {
    if (data.doc?.fileName) {
      this.#widget.props.fileName = data.doc?.fileName;
    }

    if (data.doc?.content) {
      this.#widget.props.modified = data.doc.content.modified;
    }
  }
}
