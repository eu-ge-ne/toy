import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export class FooterPlugin extends plugins.Plugin {
  readonly widget = new FooterWidget({
    disabled: false,
    ln: 0,
    col: 0,
    lnCount: 0,
  });

  override onRender(): void {
    this.widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.widget.props.disabled = !this.widget.props.disabled;
        return false;

      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }
}
