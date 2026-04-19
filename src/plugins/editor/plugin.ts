import * as commands from "@libs/commands";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";
import { EditorWidget } from "@widgets/editor";

export class EditorPlugin extends plugins.Plugin {
  readonly widget = new EditorWidget({
    multiLine: true,
  });

  override onRender(): void {
    this.widget.render();
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.widget.toggleIndex();
        return false;

      case "Theme":
        this.widget.setTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }
}
