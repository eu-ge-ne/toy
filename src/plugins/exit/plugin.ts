import * as plugins from "@libs/plugins";

export class ExitPlugin extends plugins.Plugin {
  override onStart(): void {
    globalThis.addEventListener(
      "unhandledrejection",
      (e) => this.host.onExit(e),
    );
  }

  override onExit(e?: PromiseRejectionEvent): void {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
