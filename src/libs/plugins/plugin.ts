import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  async onStart?(): Promise<void>;

  async onBeforeStop?(e?: PromiseRejectionEvent): Promise<void>;
  async onStop?(e?: PromiseRejectionEvent): Promise<void>;
  async onAfterStop?(e?: PromiseRejectionEvent): Promise<void>;

  onResize?(): void;

  onBeforeRender?(): void;
  onRender?(): void;
  onAfterRender?(): void;

  onDebugRender?(_: number): void;
  onDebugKey?(_: number): void;

  async onKey?(_: kitty.Key): Promise<boolean>;
  async onCommand?(_: commands.Command): Promise<boolean>;

  async alert?(_: string): Promise<void>;
  async ask?(_: string): Promise<boolean>;
  async askFileName?(_: string): Promise<string | undefined>;
  async fileOpen?(_: string): Promise<void>;
  async fileSave?(): Promise<boolean>;
  async fileSaveAs?(): Promise<boolean>;

  onDocWrite?(_: string): void;
  onDocRead?(): Iterable<string>;
  onDocSave?(): Promise<void>;
  onDocReset?(): void; // TODO
  onDocChange?(): void; // TODO
  onDocNameChange?(_: string): void; // TODO
  onDocCursorChange?(ln: number, col: number, lnCount: number): void; // TODO
}
