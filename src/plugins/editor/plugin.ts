import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

export function register(host: plugins.Host): void {
  const widget = new EditorWidget({
    multiLine: true,
    onTextChange: () => {
      host.statusDocModified(
        widget.modified,
        widget.lineCount,
      );
    },
    onCursorChange: (x) => host.statusDocCursor(x.ln, x.col),
    onKeyHandle: (x) => host.debugInput(x),
  });

  let zen = true;

  host.onIntercept("start", async () => {
    widget.setFocused(true);

    widget.resetChanges();
    widget.resetCursor();
  });

  host.onIntercept("stop", async ({ e }) => {
    if (e) {
      return;
    }

    if (widget.modified) {
      if (await host.ask.open("Save changes?")) {
        await host.files.save();
      }
    }
  });

  host.onReact("resize", () => {
    const { columns, rows } = Deno.consoleSize();

    if (zen) {
      widget.resize(columns, rows, 0, 0);
    } else {
      widget.resize(columns, rows - 2, 1, 0);
    }
  });

  host.onReact("render", () => widget.render());

  host.onIntercept("key.press", async ({ key }) => widget.onKey(key));

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Zen":
        widget.toggleIndex();
        zen = !zen;
        host.resize();
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

  host.registerDoc({
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
  });
}
