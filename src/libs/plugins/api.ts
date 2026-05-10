import * as events from "@libs/events";
import * as themes from "@libs/themes";

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

export type Doc = {
  open(_: string): Promise<void>;
  save(): Promise<void>;
  saveAs(): Promise<void>;
  reset(): void;
  write(_: string): void;
  read(): Iterable<string>;
  toggleWhitespace(): void;
  toggleWrap(): void;
  selectAll(): void;
  undo(): void;
  redo(): void;
  copy(): void;
  cut(): void;
  paste(): void;
};

export type Api = events.Listener<InterceptorEvents, ReactorEvents> & {
  palette: Palette;
  debug: Debug;
  alert: Alert;
  ask: Ask;
  askFileName: AskFileName;
  doc: Doc;

  runInputLoop(
    iter: (ctx: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void>;

  emitStop(e?: PromiseRejectionEvent): Promise<void>;
  emitToggleZen(): void;
  emitSetTheme(_: keyof typeof themes.Themes): void;

  emitStatusDocName(name: string): void;
  emitStatusDocModified(modified: boolean, lineCount: number): void;
  emitStatusDocCursor(ln: number, col: number): void;
};
