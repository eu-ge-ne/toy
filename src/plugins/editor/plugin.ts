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

    api.react("zen.toggle", () => {
      zen = !zen;
      widget.toggleIndex();
    });

    api.react("render", () => widget.render());
    api.intercept("key.press", async ({ key }) => widget.onKey(key));
    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
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
      toggleWhitespace(): void {
        widget.toggleWhitespace();
      },
      toggleWrap(): void {
        widget.toggleWrap();
      },
      selectAll(): void {
        widget.selectAll();
      },
      undo(): void {
        widget.undo();
      },
      redo(): void {
        widget.redo();
      },
      copy(): void {
        widget.copy();
      },
      cut(): void {
        widget.cut();
      },
      paste(): void {
        widget.paste();
      },
    };
  },
} satisfies plugins.Plugin;
