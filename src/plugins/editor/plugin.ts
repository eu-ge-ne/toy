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

      case "Whitespace":
        this.widget.toggleWhitespace();
        return true;

      case "Wrap":
        this.widget.toggleWrapped();
        return true;

      case "Copy":
        this.widget.copy();
        return true;

      case "Cut":
        this.widget.cut();
        return true;

      case "Paste":
        this.widget.paste();
        return true;

      case "Undo":
        this.widget.undo();
        return true;

      case "Redo":
        this.widget.redo();
        return true;

      case "SelectAll":
        this.widget.selectAll();
        return true;
    }

    return false;
  }
}
