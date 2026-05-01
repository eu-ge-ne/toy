import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export class FooterPlugin extends plugins.Plugin {
  #disabled = true;

  readonly #widget = new FooterWidget({
    ln: 0,
    col: 0,
    lineCount: 0,
  });

  constructor(host: plugins.Host) {
    super(host);

    host.on("resize", this.onResize);
    host.on("render", this.onRender);
    host.on("status.doc.cursor", this.onStatusDocCursor);
    host.on("status.doc.modified", this.onStatusDocModified);
  }

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    this.#widget.resize(columns, 1, rows - 1, 0);
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

  onStatusDocCursor = (ln: number, col: number) => {
    this.#widget.props.ln = ln;
    this.#widget.props.col = col;
  };

  onStatusDocModified = (_: boolean, lineCount: number) => {
    this.#widget.props.lineCount = lineCount;
  };
}
