import * as libEvents from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";

declare module "@libs/plugins" {
  export interface API {
    runtime: {
      events: libEvents.Listener<RuntimeEvents>;
      start(): Promise<void>;
      stop(e?: PromiseRejectionEvent): Promise<void>;
      open(_: string): Promise<void>;
      save(): Promise<void>;
      saveAs(): Promise<void>;
    };
  }
}

type RuntimeEvents = {
  start: (_: libEvents.EventData) => Promise<void>;
  stop: (_: libEvents.EventData<{ e?: PromiseRejectionEvent }>) => Promise<void>;
};

export function plugin(api: plugins.API): plugins.Result {
  const events = new libEvents.EventEmitter<RuntimeEvents>();

  return {
    runtime: {
      events: events.listener,

      async start(): Promise<void> {
        globalThis.addEventListener("unhandledrejection", (e) => api.runtime.stop(e));

        await events.dispatch("start", {});
      },

      async stop(e?: PromiseRejectionEvent): Promise<void> {
        if (!e && api.buffer.modified) {
          if (await api.confirmModal.open("Save changes?")) {
            await api.runtime.save();
          }
        }

        await events.dispatch("stop", { e });

        if (e) {
          console.log(e.reason);
        }

        Deno.exit(0);
      },

      async open(newFileName: string): Promise<void> {
        api.buffer.name = newFileName;

        try {
          await api.buffer.rewrite(files.load(newFileName));
        } catch (err) {
          if (err instanceof Deno.errors.NotFound) {
            // ignore
          } else {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await api.alertModal.open(message);

            await api.runtime.stop();
          }
        }
      },

      async save(): Promise<void> {
        if (!api.buffer.name) {
          await api.runtime.saveAs();
          return;
        }

        try {
          await files.save(api.buffer.name, api.buffer.read());

          api.buffer.resetUndo();
        } catch (err) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await api.alertModal.open(message);

          await api.runtime.saveAs();
        }
      },

      async saveAs(): Promise<void> {
        while (true) {
          const newFileName = await api.fileNameModal.open(api.buffer.name);
          if (!newFileName) {
            return;
          }

          try {
            await files.save(newFileName, api.buffer.read());

            api.buffer.resetUndo();

            api.buffer.name = newFileName;
          } catch (err) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await api.alertModal.open(message);
          }
        }
      },
    },
  };
}
