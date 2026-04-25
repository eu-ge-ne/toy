import * as plugins from "@libs/plugins";

export class ExitPlugin extends plugins.Plugin {
  protected name = "Exit";

  override register(): void {
    this.host.onState("Starting", this.name, async () => {
      globalThis.addEventListener(
        "unhandledrejection",
        //(e) => this.host.emitStop(e),
        () => this.host.action("Stopping"),
      );
    });

    this.host.onState("Exit", this.name, async () => {
      /*
      override async onStop(e?: PromiseRejectionEvent): Promise<void> {
      if (e) {
        console.log(e.reason);
      }
      */

      Deno.exit(0);
    });
  }
}
