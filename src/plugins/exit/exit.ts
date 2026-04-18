import { Plugin } from "@libs/plugins";

export class Exit extends Plugin {
  start(): void {
    globalThis.addEventListener("unhandledrejection", (e) => this.host.exit(e));
  }

  exit(e?: PromiseRejectionEvent): void {
    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  }
}
