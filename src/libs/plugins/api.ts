import * as commands from "@libs/commands";
import * as events from "@libs/events";

import { InterceptorEvents, ReactorEvents } from "./events.ts";

export type Palette = {
  open(): Promise<void>;
};

export type Debug = {
  toggle(): void;
};

export type Alert = {
  open(_: string): Promise<void>;
};

export type Ask = {
  open(_: string): Promise<boolean>;
};

export type AskFileName = {
  open(_: string): Promise<string | undefined>;
};

export type Files = {
  open(_: string): Promise<void>;
  save(): Promise<void>;
  saveAs(): Promise<void>;
};

export type Doc = {
  reset(): void;
  write(_: string): void;
  read(): Iterable<string>;
};

export type Api = events.Listener<InterceptorEvents, ReactorEvents> & {
  palette: Palette;
  debug: Debug;
  alert: Alert;
  ask: Ask;
  askFileName: AskFileName;
  doc: Doc;
  files: Files;

  runInputLoop(
    iter: (ctx: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void>;

  emitStop(e?: PromiseRejectionEvent): Promise<void>;
  emitCommand(cmd: commands.Command): Promise<void>;
  emitToggleZen(): void;

  emitStatusDocName(name: string): void;
  emitStatusDocModified(modified: boolean, lineCount: number): void;
  emitStatusDocCursor(ln: number, col: number): void;
};
