import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

const docSignals = new libEvents.SignalEmitter<api.DocSignals>();
const cursorSignals = new libEvents.SignalEmitter<api.CursorSignals>();

let widget: EditorWidget;
let fileName: string | undefined;

export default {
  init(host: api.Host): void {
    widget = new EditorWidget({
      multiLine: true,
      onTextChange: () =>
        docSignals.broadcast("change", { modified: widget.modified, lineCount: widget.lineCount }),
      onCursorChange: (x) => cursorSignals.broadcast("change", { ln: x.ln, col: x.col }),
    });

    widget.setFocused(true);
    widget.resetChanges();
    widget.resetCursor();

    host.zen.signals.on("toggle")(() => widget.toggleIndex());
    host.io.signals.on("render")(() => widget.render());
    host.io.events.on("key.press")(async ({ key }) => widget.onKey(key));
    host.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    host.runtime.events.on("stop")(async ({ e }) => {
      if (e) {
        return;
      }
      if (widget.modified) {
        if (await host.confirmModal.open("Save changes?")) {
          await host.doc.save();
        }
      }
    });

    host.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();
      if (host.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
  initCursor(): api.Cursor {
    return {
      signals: cursorSignals.listener,
    };
  },
  initDoc(host: api.Host): api.Doc {
    return {
      signals: docSignals.listener,
      async open(newFileName: string): Promise<void> {
        try {
          for await (const chunk of files.load(newFileName)) {
            host.doc.write(chunk);
          }

          host.doc.reset();

          docSignals.broadcast("change.name", newFileName);

          fileName = newFileName;
        } catch (err) {
          if (!(err instanceof Deno.errors.NotFound)) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await host.alertModal.open(message);

            await host.runtime.stop();
          }
        }
      },
      async save(): Promise<void> {
        if (!fileName) {
          await host.doc.saveAs();
          return;
        }

        try {
          await files.save(fileName, host.doc.read());

          host.doc.reset();
        } catch (err) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await host.alertModal.open(message);

          await host.doc.saveAs();
        }
      },
      async saveAs(): Promise<void> {
        while (true) {
          const newFileName = await host.fileNameModal.open(fileName ?? "");
          if (!newFileName) {
            return;
          }

          try {
            await files.save(newFileName, host.doc.read());

            fileName = newFileName;
            docSignals.broadcast("change.name", newFileName);

            host.doc.reset();
          } catch (err) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await host.alertModal.open(message);
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
