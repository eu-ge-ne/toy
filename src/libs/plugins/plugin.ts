import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  onStart?(): void;
  onStop?(_?: PromiseRejectionEvent): void;

  onResize?(): void;
  onRender?(): void;
  onPreRender?(): void;
  onPostRender?(): void;
  onRendered?(_: number): void;

  async onAlert?(_: string): Promise<void>;
  async onAsk?(_: string): Promise<boolean>;

  async onCommand?(_: commands.Command): Promise<boolean>;

  async onKey?(_: kitty.Key): Promise<boolean>;
  onKeyHandled?(_: number): void;

  onDocReset?(): void;
  onDocChange?(): void;
  onDocNameChange?(_: string): void;
  onDocCursorChange?(ln: number, col: number, lnCount: number): void;
}
