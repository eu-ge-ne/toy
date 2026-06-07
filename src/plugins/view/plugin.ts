import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

let signals: libEvents.SignalEmitter<api.ViewSignals>;
let widget: EditorWidget;

export default {
  register: {
    view(toy: api.Toy): api.View {
      signals = new libEvents.SignalEmitter<api.ViewSignals>();

      return {
        signals: signals.listener,

        async open(newFileName: string): Promise<void> {
          toy.buffer.name = newFileName;

          try {
            await toy.buffer.write(files.load(newFileName));

            toy.buffer.resetHistory();
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
          if (!toy.buffer.name) {
            await toy.view.saveAs();
            return;
          }

          try {
            await files.save(toy.buffer.name, toy.buffer.read());

            toy.buffer.resetHistory();
            widget.resetCursor();
          } catch (err) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await toy.alertModal.open(message);

            await toy.view.saveAs();
          }
        },

        async saveAs(): Promise<void> {
          while (true) {
            const newFileName = await toy.fileNameModal.open(toy.buffer.name);
            if (!newFileName) {
              return;
            }

            try {
              await files.save(newFileName, toy.buffer.read());

              toy.buffer.name = newFileName;

              toy.buffer.resetHistory();
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

  init(toy: api.Toy): void {
    widget = new EditorWidget(toy.buffer, {
      multiLine: true,
      onCursorChange: (x) => signals.broadcast("change.cursor", { ln: x.ln, col: x.col }),
    });
    widget.resetCursor();

    toy.zen.signals.on("toggle")(() => widget.toggleIndex());
    toy.io.signals.on("render")(() => widget.render());
    toy.io.events.on("key.press")(async ({ key }) => widget.onKeyPress(key));
    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.runtime.events.on("stop")(async ({ e }) => {
      if (e) {
        return;
      }
      if (toy.buffer.modified) {
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
} satisfies plugins.Plugin;
