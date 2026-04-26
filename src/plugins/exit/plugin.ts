import * as plugins from "@libs/plugins";

export class ExitPlugin extends plugins.Plugin {
  override async onStart(): Promise<void> {
    globalThis.addEventListener(
      "unhandledrejection",
      (e) => this.host.emitStop(e),
    );
  }

  override async onPostStop(e?: PromiseRejectionEvent): Promise<void> {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
