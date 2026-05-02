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

    host.onSync("resize", this.onResize);
    host.onSync("render", this.onRender);
    host.onSync("status.doc.name", this.onStatusDocName);
    host.onSync("status.doc.modified", this.onStatusDocModified);
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

  override async onCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Zen":
        this.#disabled = !this.#disabled;
        this.host.resize();
        return;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  }

  onStatusDocName = (fileName: string) => {
    this.#widget.props.fileName = fileName;
  };

  onStatusDocModified = (modified: boolean) => {
    this.#widget.props.modified = modified;
  };
}
