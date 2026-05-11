import * as api from "@libs/api";
import * as events from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

let widget: EditorWidget;
let fileName: string | undefined;
let zen = true;

const docApiClients = new events.Clients<
  api.DocInterceptorEvents,
  api.DocReactorEvents
>();

const docApiEmitter = new events.Emitter<
  api.DocInterceptorEvents,
  api.DocReactorEvents
>(docApiClients);

const docApiListener = new events.Listener<
  api.DocInterceptorEvents,
  api.DocReactorEvents
>(docApiClients);

const cursorApiClients = new events.Clients<
  api.CursorInterceptorEvents,
  api.CursorReactorEvents
>();

const cursorApiEmitter = new events.Emitter<
  api.CursorInterceptorEvents,
  api.CursorReactorEvents
>(cursorApiClients);

const cursorApiListener = new events.Listener<
  api.CursorInterceptorEvents,
  api.CursorReactorEvents
>(cursorApiClients);

export default {
  init(api: api.Api): void {
    widget = new EditorWidget({
      multiLine: true,
      onTextChange: () =>
        docApiEmitter.react("change", {
          modified: widget.modified,
          lineCount: widget.lineCount,
        }),
      onCursorChange: (x) =>
        cursorApiEmitter.react("change", { ln: x.ln, col: x.col }),
    });

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
        if (await api.confirmModal.open("Save changes?")) {
          await api.doc.save();
        }
      }
    });

    api.io.events.react("resize", () => {
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

    api.io.events.react("render", () => widget.render());
    api.io.events.intercept("key.press", async ({ key }) => widget.onKey(key));
    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
  },
  docApi(api: api.Api): api.DocApi {
    return {
      events: docApiListener,
      async open(newFileName: string): Promise<void> {
        try {
          for await (const chunk of files.load(newFileName)) {
            api.doc.write(chunk);
          }

          api.doc.reset();

          docApiEmitter.react("change.name", newFileName);

          fileName = newFileName;
        } catch (err) {
          if (!(err instanceof Deno.errors.NotFound)) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alertModal.open(message);

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
            docApiEmitter.react("change.name", newFileName);

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
  cursorApi(): api.CursorApi {
    return {
      events: cursorApiListener,
    };
  },
} satisfies plugins.Plugin;
