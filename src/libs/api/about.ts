import { Host } from "./host.ts";

export abstract class About {
  constructor(protected host: Host) {
  }

  abstract get version(): string;
}
