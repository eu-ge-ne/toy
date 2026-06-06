import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as libEvents from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

const signals = new libEvents.SignalEmitter<api.ViewSignals>();

let buffer: buffers.Buffer;
let widget: EditorWidget;
let fileName: string | undefined;

export default {
  init(toy: api.Toy): void {
    buffer = new buffers.Buffer();
    buffer.onChange = () =>
      signals.broadcast("change", { modified: buffer.modified, lineCount: buffer.lineCount });

    widget = new EditorWidget(buffer, {
      multiLine: true,
      onCursorChange: (x) => signals.broadcast("change.cursor", { ln: x.ln, col: x.col }),
    });

    buffer.resetHistory();
    widget.resetCursor();

    toy.zen.signals.on("toggle")(() => widget.toggleIndex());
    toy.io.signals.on("render")(() => widget.render());
    toy.io.events.on("key.press")(async ({ key }) => widget.onKeyPress(key));
    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.runtime.events.on("stop")(async ({ e }) => {
      if (e) {
        return;
      }
      if (buffer.modified) {
        if (await toy.confirmModal.open("Save changes?")) {
          await toy.view.save();
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
    view(toy: api.Toy): api.View {
      return {
        signals: signals.listener,

        async open(newFileName: string): Promise<void> {
          fileName = newFileName;

          signals.broadcast("change.name", newFileName);

          try {
            await buffer.write(files.load(newFileName));

            buffer.resetHistory();
            widget.resetCursor();
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
            await toy.view.saveAs();
            return;
          }

          try {
            await files.save(fileName, buffer.read());

            buffer.resetHistory();
            widget.resetCursor();
          } catch (err) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await toy.alertModal.open(message);

            await toy.view.saveAs();
          }
        },

        async saveAs(): Promise<void> {
          while (true) {
            const newFileName = await toy.fileNameModal.open(fileName ?? "");
            if (!newFileName) {
              return;
            }

            try {
              await files.save(newFileName, buffer.read());

              fileName = newFileName;
              signals.broadcast("change.name", newFileName);

              buffer.resetHistory();
              widget.resetCursor();

              return;
            } catch (err) {
              const message = Error.isError(err) ? err.message : Deno.inspect(err);
              await toy.alertModal.open(message);
            }
          }
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
