import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { AskWidget } from "./widget.ts";

export class AskPlugin extends plugins.Plugin {
  readonly widget = new AskWidget();

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }
}
