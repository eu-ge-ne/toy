import * as api from "@libs/api";
import * as events from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

let widget: EditorWidget;
let fileName: string | undefined;

const docEvents = events.create<
  api.DocInterceptorEvents,
  api.DocReactorEvents
>();

const cursorEvents = events.create<
  api.CursorInterceptorEvents,
  api.CursorReactorEvents
>();

export default {
  init(api: api.API): void {
    widget = new EditorWidget({
      multiLine: true,
      onTextChange: () =>
        docEvents.emitter.broadcast("change", {
          modified: widget.modified,
          lineCount: widget.lineCount,
        }),
      onCursorChange: (x) =>
        cursorEvents.emitter.broadcast("change", { ln: x.ln, col: x.col }),
    });

    widget.setFocused(true);
    widget.resetChanges();
    widget.resetCursor();

    api.zen.events.react("toggle", () => widget.toggleIndex());
    api.io.events.react("render", () => widget.render());
    api.io.events.intercept("key.press", async ({ key }) => widget.onKey(key));
    api.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    api.runtime.events.intercept("stop", async ({ e }) => {
      if (e) {
        return;
      }
      if (widget.modified) {
        if (await api.confirmModal.open("Save changes?")) {
          await api.doc.save();
        }
      }
    });

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();
      if (api.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
  initCursor(): api.CursorAPI {
    return {
      events: cursorEvents.listener,
    };
  },
  initDoc(api: api.API): api.DocAPI {
    return {
      events: docEvents.listener,
      async open(newFileName: string): Promise<void> {
        try {
          for await (const chunk of files.load(newFileName)) {
            api.doc.write(chunk);
          }

          api.doc.reset();

          docEvents.emitter.broadcast("change.name", newFileName);

          fileName = newFileName;
        } catch (err) {
          if (!(err instanceof Deno.errors.NotFound)) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alertModal.open(message);

            await api.runtime.stop();
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
          await api.alertModal.open(message);

          await api.doc.saveAs();
        }
      },
      async saveAs(): Promise<void> {
        while (true) {
          const newFileName = await api.fileNameModal.open(fileName ?? "");
          if (!newFileName) {
            return;
          }

          try {
            await files.save(newFileName, api.doc.read());

            fileName = newFileName;
            docEvents.emitter.broadcast("change.name", newFileName);

            api.doc.reset();
          } catch (err) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alertModal.open(message);
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
