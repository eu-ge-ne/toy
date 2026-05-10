import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

let widget: EditorWidget;

export default {
  init(api: plugins.Api): void {
    widget = new EditorWidget({
      multiLine: true,
      onTextChange: () =>
        api.emitStatusDocModified(widget.modified, widget.lineCount),
      onCursorChange: (x) => api.emitStatusDocCursor(x.ln, x.col),
    });

    let zen = true;

    api.intercept("start", async () => {
      widget.setFocused(true);

      widget.resetChanges();
      widget.resetCursor();
    });

    api.intercept("stop", async ({ e }) => {
      if (e) {
        return;
      }

      if (widget.modified) {
        if (await api.ask.open("Save changes?")) {
          await api.files.save();
        }
      }
    });

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      if (zen) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });

    api.react("render", () => widget.render());

    api.intercept("key.press", async ({ key }) => widget.onKey(key));

    api.intercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Zen":
          zen = !zen;
          widget.toggleIndex();
          return;

        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;

        case "Whitespace":
          widget.toggleWhitespace();
          return;

        case "Wrap":
          widget.toggleWrapped();
          return;

        case "Copy":
          widget.copy();
          return;

        case "Cut":
          widget.cut();
          return;

        case "Paste":
          widget.paste();
          return;

        case "Undo":
          widget.undo();
          return;

        case "Redo":
          widget.redo();
          return;

        case "SelectAll":
          widget.selectAll();
          return;
      }
    });
  },
  initDoc(): plugins.Doc {
    return {
      reset(): void {
        widget.resetChanges();
        widget.resetCursor();
      },
      write(chunk: string): void {
        widget.append(chunk);
      },
      read(): Iterable<string> {
        return widget.read();
      },
    };
  },
} satisfies plugins.Plugin;
