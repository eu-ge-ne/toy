import * as plugins from "@libs/plugins";

export class ExitPlugin extends plugins.Plugin {
  constructor(host: plugins.Host) {
    super(host);

    host.on("start", this.onStart);
    host.on("afterStop", this.onStopAfter);
  }

  onStart(): void {
    globalThis.addEventListener(
      "unhandledrejection",
      (e) => this.host.stop(e),
    );
  }

  onStopAfter = async (e?: PromiseRejectionEvent) => {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  };
}
