import * as plugins from "@libs/plugins";

export class ExitPlugin extends plugins.Plugin {
  override onStart(): void {
    globalThis.addEventListener(
      "unhandledrejection",
      (e) => this.host.emitStop(e),
    );
  }

  override onStop(e?: PromiseRejectionEvent): void {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
