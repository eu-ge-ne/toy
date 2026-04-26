import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export interface RegisterParams {
  setFileOpenHandler(_: (_: string) => Promise<void>): void;
  setFileSaveHandler(_: () => Promise<boolean>): void;
  setFileSaveAsHandler(_: () => Promise<boolean>): void;
}

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  register?(params: RegisterParams): void;

  async onStart?(): Promise<void>;
  async onPreStop?(e?: PromiseRejectionEvent): Promise<void>;
  async onStop?(e?: PromiseRejectionEvent): Promise<void>;
  async onPostStop?(e?: PromiseRejectionEvent): Promise<void>;

  onResize?(): void;
  onRender?(): void;
  onPreRender?(): void;
  onPostRender?(): void;
  onRendered?(_: number): void;

  alert?(_: string): Promise<void>;
  ask?(_: string): Promise<boolean>;
  askFileName?(_: string): Promise<string | undefined>;

  //

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
