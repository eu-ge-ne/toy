import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export class FooterPlugin extends plugins.Plugin {
  #disabled = true;

  readonly #widget = new FooterWidget({
    ln: 0,
    col: 0,
    lnCount: 0,
  });

  override onResize(): void {
    const { columns, rows } = Deno.consoleSize();

    this.#widget.resize(columns, 1, rows - 1, 0);
  }

  override onRender(): void {
    if (this.#disabled) {
      return;
    }
    this.#widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#disabled = !this.#disabled;
        this.host.emitResize();
        return false;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  override onStatus(data: plugins.StatusData): void {
    if (data.docCursorChanged) {
      this.#widget.props.ln = data.docCursorChanged.ln;
      this.#widget.props.col = data.docCursorChanged.col;
    }

    if (data.docContent) {
      this.#widget.props.lnCount = data.docContent.lineCount;
    }
  }
}
