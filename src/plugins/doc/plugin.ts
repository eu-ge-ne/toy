import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

let widget: EditorWidget;
let fileName: string | undefined;

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
          await api.doc.save();
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
  initDoc(api: plugins.Api): plugins.Doc {
    return {
      async open(newFileName: string): Promise<void> {
        try {
          for await (const chunk of files.load(newFileName)) {
            api.doc.write(chunk);
          }

          api.doc.reset();

          api.emitStatusDocName(newFileName);

          fileName = newFileName;
        } catch (err) {
          if (!(err instanceof Deno.errors.NotFound)) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alert.open(message);

            await api.emitStop();
          }
        }
      },
      async save(): Promise<void> {
        if (!fileName) {
          await api.doc.saveAs();
          return;
        }

        try {
          await files.save(fileName, api.doc.read());

          api.doc.reset();
        } catch (err) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await api.alert.open(message);

          await api.doc.saveAs();
        }
      },
      async saveAs(): Promise<void> {
        while (true) {
          const newFileName = await api.askFileName.open(fileName ?? "");
          if (!newFileName) {
            return;
          }

          try {
            await files.save(newFileName, api.doc.read());

            fileName = newFileName;
            api.emitStatusDocName(newFileName);

            api.doc.reset();
          } catch (err) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alert.open(message);
          }
        }
      },
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
