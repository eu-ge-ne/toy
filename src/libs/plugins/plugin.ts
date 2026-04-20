import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  onStart(): void {
  }

  onExit(_?: PromiseRejectionEvent): void {
  }

  onRender(): void {
  }

  async onKey(_: kitty.Key): Promise<boolean> {
    return false;
  }

  async onCommand(_: commands.Command): Promise<boolean> {
    return false;
  }

  onDocNameChange(_: string): void {
  }

  onDocContentChange(): void {
  }

  onDocContentReset(): void {
  }
}
