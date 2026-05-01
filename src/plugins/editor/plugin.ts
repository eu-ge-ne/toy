import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

export class EditorPlugin extends plugins.Plugin {
  #zen = true;

  readonly #widget = new EditorWidget({
    multiLine: true,
    onTextChange: () => {
      this.host.emitStatus({
        doc: {
          content: {
            modified: this.#widget.modified,
            lineCount: this.#widget.lineCount,
          },
        },
      });
    },
    onCursorChange: (x) => this.host.emitStatus({ doc: { cursor: x } }),
    onKeyHandle: (x) => this.host.emitDebug({ inputElapsed: x }),
  });

  constructor(host: plugins.Host) {
    super(host);

    host.on("start", this.onStart);
    host.on("resize", this.onResize);
    host.on("render", this.onRender);
  }

  onStart = () => {
    this.#widget.setFocused(true);

    this.#widget.resetChanges();
    this.#widget.resetCursor();
  };

  override async onStopBefore?(e?: PromiseRejectionEvent): Promise<void> {
    if (e) {
      return;
    }

    if (this.#widget.modified) {
      if (await this.host.ask.open("Save changes?")) {
        await this.host.files.save();
      }
    }
  }

  onResize = () => {
    const { columns, rows } = Deno.consoleSize();

    if (this.#zen) {
      this.#widget.resize(columns, rows, 0, 0);
    } else {
      this.#widget.resize(columns, rows - 2, 1, 0);
    }
  };

  onRender = () => {
    this.#widget.render();
  };

  override async onKey(key: kitty.Key): Promise<boolean> {
    if (commands.ShortcutToCommand[kitty.shortcut(key)]) {
      return false;
    }

    return this.#widget.onKey(key);
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        this.#widget.toggleIndex();
        this.#zen = !this.#zen;
        this.host.resize();
        return false;

      case "Theme":
        this.#widget.setTheme(themes.Themes[cmd.data]);
        return false;

      case "Whitespace":
        this.#widget.toggleWhitespace();
        return true;

      case "Wrap":
        this.#widget.toggleWrapped();
        return true;

      case "Copy":
        this.#widget.copy();
        return true;

      case "Cut":
        this.#widget.cut();
        return true;

      case "Paste":
        this.#widget.paste();
        return true;

      case "Undo":
        this.#widget.undo();
        return true;

      case "Redo":
        this.#widget.redo();
        return true;

      case "SelectAll":
        this.#widget.selectAll();
        return true;
    }

    return false;
  }

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
