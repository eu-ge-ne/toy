import * as api from "@libs/api";
import * as libEvents from "@libs/events";
import * as plugins from "@libs/plugins";

const MIB = Math.pow(1024, 2);
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
          await events.dispatch("stop", { e });

          if (e) {
            console.log(e.reason);
          }

          Deno.exit(0);
        },
        memUsage(): { rss: number; heapTotal: number; heapUsed: number; external: number } {
          const mem = Deno.memoryUsage();

          return {
            rss: mem.rss / MIB,
            heapTotal: mem.heapTotal / MIB,
            heapUsed: mem.heapUsed / MIB,
            external: mem.external / MIB,
          };
        },
      };
    },
  },
} satisfies plugins.Plugin;
