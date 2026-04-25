import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as std from "@libs/std";

import { Plugin } from "./plugin.ts";

type State = "0" | "Starting" | "Started" | "Stopping" | "Stopped" | "Exit";

type TAction<T> = { name: T };
type Start = TAction<"Start">;
type Stop = TAction<"Stop">;
type Action = Start | Stop;

type FSM = Record<
  State,
  | { [_ in Action["name"]]?: State }
  | State
>;

export class Host {
  protected readonly plugins: Plugin[] = [];

  register(...plugins: Plugin[]): void {
    for (const x of plugins) {
      x.register?.();
    }
    this.plugins.push(...plugins);
  }

  //

  #fsm: FSM = {
    0: {
      Start: "Starting",
    },
    Starting: "Started",
    Started: {
      Stop: "Stopping",
    },
    Stopping: "Stopped",
    Stopped: "Exit",
    Exit: {},
  };

  #state: State = "0";

  #stateListeners: Record<State, { name: string; fn: () => Promise<void> }[]> =
    {
      0: [],
      Starting: [],
      Started: [],
      Stopping: [],
      Stopped: [],
      Exit: [],
    };

  async action(act: Action["name"]): Promise<void> {
    const currentState = this.#fsm[this.#state];

    if (typeof currentState === "object") {
      const newState = currentState[act];
      if (!newState) {
        std.log.error({ state: this.#state, act }, "Invalid state/action");
        return;
      }

      std.log.info(
        { oldState: this.#state, act, newState },
        "State transition",
      );
      this.#state = newState;

      await this.#runStateListeners();
    }

    while (true) {
      const state = this.#fsm[this.#state];
      if (typeof state !== "string") {
        break;
      }

      std.log.info(
        { oldState: this.#state, newState: state },
        "State transition",
      );
      this.#state = state;

      await this.#runStateListeners();
    }
  }

  onState(state: State, name: string, fn: () => Promise<void>): void {
    this.#stateListeners[state].push({ name, fn });
  }

  async #runStateListeners(): Promise<void> {
    for (const x of this.#stateListeners[this.#state]) {
      std.log.info(
        { state: this.#state, listener: x.name },
        "Running state listener",
      );
      await x.fn();
    }
  }

  //

  emitResize(): void {
    for (const x of this.plugins) {
      x.onResize?.();
    }
  }

  emitRender(): void {
    for (const x of this.plugins) {
      x.onPreRender?.();
    }

    for (const x of this.plugins) {
      x.onRender?.();
    }

    for (const x of this.plugins) {
      x.onPostRender?.();
    }
  }

  emitRendered(elapsed: number): void {
    for (const x of this.plugins) {
      x.onRendered?.(elapsed);
    }
  }

  async emitAlert(message: string): Promise<void> {
    for (const x of this.plugins) {
      await x.onAlert?.(message);
    }
  }

  async emitAsk(message: string): Promise<boolean> {
    for (const x of this.plugins) {
      if (await x.onAsk?.(message)) {
        return true;
      }
    }
    return false;
  }

  async emitAskFileName(fileName: string): Promise<string | undefined> {
    for (const x of this.plugins) {
      const newFileName = await x.onAskFileName?.(fileName);
      if (newFileName) {
        return newFileName;
      }
    }
  }

  async emitFileOpen(fileName: string): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onFileOpen?.(fileName)) {
        return;
      }
    }
  }

  async emitFileSave(): Promise<boolean> {
    for (const x of this.plugins) {
      if (await x.onFileSave?.()) {
        return true;
      }
    }
    return false;
  }

  async emitFileSaveAs(): Promise<boolean> {
    for (const x of this.plugins) {
      if (await x.onFileSaveAs?.()) {
        return true;
      }
    }
    return false;
  }

  async emitCommand(cmd: commands.Command): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onCommand?.(cmd)) {
        return;
      }
    }
  }

  async emitKey(key: kitty.Key): Promise<void> {
    for (const x of this.plugins) {
      if (await x.onKey?.(key)) {
        return;
      }
    }
  }

  emitKeyHandled(elapsed: number): void {
    for (const x of this.plugins) {
      x.onKeyHandled?.(elapsed);
    }
  }

  emitDocWrite(chunk: string): void {
    for (const x of this.plugins) {
      x.onDocWrite?.(chunk);
    }
  }

  emitDocRead(): Iterable<string> {
    for (const x of this.plugins) {
      if (x.onDocRead) {
        return x.onDocRead();
      }
    }
    return Iterator.from([]);
  }

  async emitDocSave(): Promise<void> {
    for (const x of this.plugins) {
      x.onDocSave?.();
    }
  }

  emitDocReset(): void {
    for (const x of this.plugins) {
      x.onDocReset?.();
    }
  }

  emitDocChange(): void {
    for (const x of this.plugins) {
      x.onDocChange?.();
    }
  }

  emitDocNameChange(docName: string): void {
    for (const x of this.plugins) {
      x.onDocNameChange?.(docName);
    }
  }

  emitDocCursorChange(ln: number, col: number, lnCount: number): void {
    for (const x of this.plugins) {
      x.onDocCursorChange?.(ln, col, lnCount);
    }
  }
}
