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
  init(toy: api.Toy): void {
    widget = new EditorWidget({
      multiLine: true,
      onTextChange: () =>
        docSignals.broadcast("change", { modified: widget.modified, lineCount: widget.lineCount }),
      onCursorChange: (x) => cursorSignals.broadcast("change", { ln: x.ln, col: x.col }),
    });

    widget.setFocused(true);
    widget.resetChanges();
    widget.resetCursor();

    toy.zen.signals.on("toggle")(() => widget.toggleIndex());
    toy.io.signals.on("render")(() => widget.render());
    toy.io.events.on("key.press")(async ({ key }) => widget.onKey(key));
    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.runtime.events.on("stop")(async ({ e }) => {
      if (e) {
        return;
      }
      if (widget.modified) {
        if (await toy.confirmModal.open("Save changes?")) {
          await toy.doc.save();
        }
      }
    });

    toy.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();
      if (toy.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
  register: {
    cursor(): api.Cursor {
      return {
        signals: cursorSignals.listener,
      };
    },
    doc(toy: api.Toy): api.Doc {
      return {
        signals: docSignals.listener,
        async open(newFileName: string): Promise<void> {
          fileName = newFileName;

          docSignals.broadcast("change.name", newFileName);

          try {
            for await (const chunk of files.load(newFileName)) {
              toy.doc.write(chunk);
            }

            toy.doc.reset();
          } catch (err) {
            if (err instanceof Deno.errors.NotFound) {
              // ignore
            } else {
              const message = Error.isError(err) ? err.message : Deno.inspect(err);
              await toy.alertModal.open(message);

              await toy.runtime.stop();
            }
          }
        },
        async save(): Promise<void> {
          if (!fileName) {
            await toy.doc.saveAs();
            return;
          }

          try {
            await files.save(fileName, toy.doc.read());

            toy.doc.reset();
          } catch (err) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await toy.alertModal.open(message);

            await toy.doc.saveAs();
          }
        },
        async saveAs(): Promise<void> {
          while (true) {
            const newFileName = await toy.fileNameModal.open(fileName ?? "");
            if (!newFileName) {
              return;
            }

            try {
              await files.save(newFileName, toy.doc.read());

              fileName = newFileName;
              docSignals.broadcast("change.name", newFileName);

              toy.doc.reset();
            } catch (err) {
              const message = Error.isError(err) ? err.message : Deno.inspect(err);
              await toy.alertModal.open(message);
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
  },
} satisfies plugins.Plugin;
