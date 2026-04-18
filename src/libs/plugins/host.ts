import { Plugin } from "./plugin.ts";

export abstract class PluginHost {
  readonly plugins: Plugin[] = [];

  abstract refresh(): void;

  start(): void {
    this.plugins.forEach((x) => x.start());
  }

  exit(e?: PromiseRejectionEvent): void {
    this.plugins.forEach((x) => x.exit(e));
  }
}
