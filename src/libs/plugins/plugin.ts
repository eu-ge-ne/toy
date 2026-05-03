import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }
}
