import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export class FooterPlugin extends plugins.Plugin {
  #disabled = true;

  readonly widget = new FooterWidget({
    ln: 0,
    col: 0,
    lnCount: 0,
  });

  override onRender(): void {
    if (this.#disabled) {
      return;
    }
    this.widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#disabled = !this.#disabled;
        this.host.resize();
        return false;

      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }

  override onCursorChange(
    data: { ln: number; col: number; lnCount: number },
  ): void {
    this.widget.props.ln = data.ln;
    this.widget.props.col = data.col;
    this.widget.props.lnCount = data.lnCount;
  }
}
