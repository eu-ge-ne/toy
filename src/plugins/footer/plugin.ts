import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export class FooterPlugin {
  #disabled = true;

  readonly #widget = new FooterWidget({
    ln: 0,
    col: 0,
    lineCount: 0,
  });

  constructor(private readonly host: plugins.Host) {
    host.onReact("resize", this.onResize);
    host.onReact("render", this.onRender);
    host.onReact("status.doc.cursor", this.onStatusDocCursor);
    host.onReact("status.doc.modified", this.onStatusDocModified);
    host.onIntercept("command", this.onCommand);
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

  onCommand = async ({ cmd }: { cmd: commands.Command }) => {
    switch (cmd.name) {
      case "Zen":
        this.#disabled = !this.#disabled;
        this.host.resize();
        return;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  };

  onStatusDocCursor = ({ ln, col }: { ln: number; col: number }) => {
    this.#widget.props.ln = ln;
    this.#widget.props.col = col;
  };

  onStatusDocModified = ({ lineCount }: { lineCount: number }) => {
    this.#widget.props.lineCount = lineCount;
  };
}
