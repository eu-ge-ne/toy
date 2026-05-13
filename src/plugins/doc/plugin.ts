import * as api from "@libs/api";
import * as events from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { EditorWidget } from "@widgets/editor";

export default class DocPlugin extends plugins.Plugin {
  #docEvents = events.create<api.DocInterceptorEvents, api.DocReactorEvents>();

  #cursorEvents = events.create<
    api.CursorInterceptorEvents,
    api.CursorReactorEvents
  >();

  #fileName: string | undefined;

  #widget = new EditorWidget({
    multiLine: true,
    onTextChange: () =>
      this.#docEvents.emitter.broadcast("change", {
        modified: this.#widget.modified,
        lineCount: this.#widget.lineCount,
      }),
    onCursorChange: (x) =>
      this.#cursorEvents.emitter.broadcast("change", { ln: x.ln, col: x.col }),
  });

  override init(api: api.API): void {
    this.#widget.setFocused(true);
    this.#widget.resetChanges();
    this.#widget.resetCursor();

    api.zen.react("toggle", () => this.#widget.toggleIndex());
    api.io.events.react("render", () => this.#widget.render());
    api.io.events.intercept(
      "key.press",
      async ({ key }) => this.#widget.onKey(key),
    );
    api.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    api.runtime.events.intercept("stop", async ({ e }) => {
      if (e) {
        return;
      }
      if (this.#widget.modified) {
        if (await api.confirmModal.open("Save changes?")) {
          await api.doc.save();
        }
      }
    });

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();
      if (api.zen.enabled()) {
        this.#widget.resize(columns, rows, 0, 0);
      } else {
        this.#widget.resize(columns, rows - 2, 1, 0);
      }
    });
  }

  override initCursor(): api.CursorAPI {
    return {
      events: this.#cursorEvents.listener,
    };
  }

  override initDoc(api: api.API): api.DocAPI {
    return {
      events: this.#docEvents.listener,
      open: async (newFileName: string) => {
        try {
          for await (const chunk of files.load(newFileName)) {
            api.doc.write(chunk);
          }

          api.doc.reset();

          this.#docEvents.emitter.broadcast("change.name", newFileName);

          this.#fileName = newFileName;
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
      save: async () => {
        if (!this.#fileName) {
          await api.doc.saveAs();
          return;
        }

        try {
          await files.save(this.#fileName, api.doc.read());

          api.doc.reset();
        } catch (err) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await api.alertModal.open(message);

          await api.doc.saveAs();
        }
      },
      saveAs: async () => {
        while (true) {
          const newFileName = await api.fileNameModal.open(
            this.#fileName ?? "",
          );
          if (!newFileName) {
            return;
          }

          try {
            await files.save(newFileName, api.doc.read());

            this.#fileName = newFileName;
            this.#docEvents.emitter.broadcast("change.name", newFileName);

            api.doc.reset();
          } catch (err) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alertModal.open(message);
          }
        }
      },
      reset: () => {
        this.#widget.resetChanges();
        this.#widget.resetCursor();
      },
      write: (chunk: string) => {
        this.#widget.append(chunk);
      },
      read: () => {
        return this.#widget.read();
      },
      toggleWhitespace: () => {
        this.#widget.toggleWhitespace();
      },
      toggleWrap: () => {
        this.#widget.toggleWrap();
      },
      selectAll: () => {
        this.#widget.selectAll();
      },
      undo: () => {
        this.#widget.undo();
      },
      redo: () => {
        this.#widget.redo();
      },
      copy: () => {
        this.#widget.copy();
      },
      cut: () => {
        this.#widget.cut();
      },
      paste: () => {
        this.#widget.paste();
      },
    };
  }
}
