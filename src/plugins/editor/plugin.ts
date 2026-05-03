import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

export class EditorPlugin {
  #zen = true;

  readonly #widget = new EditorWidget({
    multiLine: true,
    onTextChange: () => {
      this.host.statusDocModified(
        this.#widget.modified,
        this.#widget.lineCount,
      );
    },
    onCursorChange: (x) => this.host.statusDocCursor(x.ln, x.col),
    onKeyHandle: (x) => this.host.debugInput(x),
  });

  constructor(private readonly host: plugins.Host) {
    host.onIntercept("start", this.onStart);
    host.onIntercept("stop", this.onStop);
    host.onReact("resize", this.onResize);
    host.onReact("render", () => this.#widget.render());
    host.onIntercept("key.press", this.onKey);
    host.onIntercept("command", this.onCommand);
  }

  onStart = async () => {
    this.#widget.setFocused(true);

    this.#widget.resetChanges();
    this.#widget.resetCursor();
  };

  onStop = async ({ e }: { e?: PromiseRejectionEvent }) => {
    if (e) {
      return;
    }

    if (this.#widget.modified) {
      if (await this.host.ask.open("Save changes?")) {
        await this.host.files.save();
      }
    }
  };

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    if (this.#zen) {
      this.#widget.resize(columns, rows, 0, 0);
    } else {
      this.#widget.resize(columns, rows - 2, 1, 0);
    }
  };

  onKey = async ({ key }: { key: kitty.Key }) => {
    this.#widget.onKey(key);
  };

  onCommand = async ({ cmd }: { cmd: commands.Command }) => {
    switch (cmd.name) {
      case "Zen":
        this.#widget.toggleIndex();
        this.#zen = !this.#zen;
        this.host.resize();
        return;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return;

      case "Whitespace":
        this.#widget.toggleWhitespace();
        return;

      case "Wrap":
        this.#widget.toggleWrapped();
        return;

      case "Copy":
        this.#widget.copy();
        return;

      case "Cut":
        this.#widget.cut();
        return;

      case "Paste":
        this.#widget.paste();
        return;

      case "Undo":
        this.#widget.undo();
        return;

      case "Redo":
        this.#widget.redo();
        return;

      case "SelectAll":
        this.#widget.selectAll();
        return;
    }
  };

  reset(): void {
    this.#widget.resetChanges();
    this.#widget.resetCursor();
  }

  write(chunk: string): void {
    this.#widget.append(chunk);
  }

  read(): Iterable<string> {
    return this.#widget.read();
  }
}
