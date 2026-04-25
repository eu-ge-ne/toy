import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  protected abstract name: string;

  constructor(protected readonly host: Host) {
  }

  register?(): void;

  onResize?(): void;
  onRender?(): void;
  onPreRender?(): void;
  onPostRender?(): void;
  onRendered?(_: number): void;

  async onAlert?(_: string): Promise<void>;
  async onAsk?(_: string): Promise<boolean>;
  async onAskFileName?(_: string): Promise<string | undefined>;

  async onFileOpen?(_: string): Promise<void>;
  async onFileSave?(): Promise<boolean>;
  async onFileSaveAs?(): Promise<boolean>;

  async onCommand?(_: commands.Command): Promise<boolean>;

  async onKey?(_: kitty.Key): Promise<boolean>;
  onKeyHandled?(_: number): void;

  onDocWrite?(_: string): void;
  onDocRead?(): Iterable<string>;
  onDocSave?(): Promise<void>;
  onDocReset?(): void; // TODO
  onDocChange?(): void; // TODO
  onDocNameChange?(_: string): void; // TODO
  onDocCursorChange?(ln: number, col: number, lnCount: number): void; // TODO
}
