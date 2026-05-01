import * as plugins from "@libs/plugins";

export class ExitPlugin extends plugins.Plugin {
  constructor(host: plugins.Host) {
    super(host);

    host.on("start", this.onStart);
  }

  onStart(): void {
    globalThis.addEventListener(
      "unhandledrejection",
      (e) => this.host.emitStop(e),
    );
  }

  override async onStopAfter(e?: PromiseRejectionEvent): Promise<void> {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
