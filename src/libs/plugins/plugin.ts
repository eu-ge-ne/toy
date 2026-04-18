import { PluginHost } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: PluginHost) {
  }

  abstract start(): void;
  abstract exit(e?: PromiseRejectionEvent): void;
}
