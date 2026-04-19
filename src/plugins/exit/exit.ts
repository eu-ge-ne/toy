import * as plugins from "@libs/plugins";

export class Exit extends plugins.Plugin {
  override start(): void {
    globalThis.addEventListener("unhandledrejection", (e) => this.host.exit(e));
  }

  override exit(e?: PromiseRejectionEvent): void {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
