import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as files from "@libs/files";
import * as plugins from "@libs/plugins";

const events = new libEvents.EventEmitter<api.RuntimeEvents>();

export default {
  register: {
    runtime(toy: api.Toy): api.Runtime {
      return {
        events: events.listener,

        async start(): Promise<void> {
          globalThis.addEventListener("unhandledrejection", (e) => toy.runtime.stop(e));

          await events.dispatch("start", {});
        },

        async stop(e?: PromiseRejectionEvent): Promise<void> {
          if (!e && toy.buffer.modified) {
            if (await toy.confirmModal.open("Save changes?")) {
              await toy.runtime.save();
            }
          }

          await events.dispatch("stop", { e });

          if (e) {
            console.log(e.reason);
          }

          Deno.exit(0);
        },

        async open(newFileName: string): Promise<void> {
          toy.buffer.name = newFileName;

          try {
            await toy.buffer.rewrite(files.load(newFileName));
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
            await toy.runtime.saveAs();
            return;
          }

          try {
            await files.save(toy.buffer.name, toy.buffer.read());

            toy.buffer.resetUndo();
          } catch (err) {
            const message = Error.isError(err) ? err.message : Deno.inspect(err);
            await toy.alertModal.open(message);

            await toy.runtime.saveAs();
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

              toy.buffer.resetUndo();

              toy.buffer.name = newFileName;
            } catch (err) {
              const message = Error.isError(err) ? err.message : Deno.inspect(err);
              await toy.alertModal.open(message);
            }
          }
        },
      };
    },
  },
} satisfies plugins.Plugin;
