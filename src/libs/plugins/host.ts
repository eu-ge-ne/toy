import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as std from "@libs/std";

import { Plugin } from "./plugin.ts";

const states = {
  "0": async () => {},
  Starting: async () => {},
  Started: async () => {},
  Running: async () => {},
  Alerting: async (_: string) => {},
  Stopping: async () => {},
  Stopped: async () => {},
  Exit: async () => {},
} as const;

type States = typeof states;
type StateName = keyof States;

type FSM = Record<StateName, StateName[] | StateName>;

type StateListeners = {
  [Prop in StateName]: { name: string; fn: States[Prop] }[];
};

export class Host {
  protected readonly plugins: Plugin[] = [];

  register(...plugins: Plugin[]): void {
    for (const x of plugins) {
      x.register?.();
    }
    this.plugins.push(...plugins);
  }

  #fsm: FSM = {
    0: ["Starting"],
    Starting: "Started",
    Started: "Running",
    Running: ["Alerting", "Stopping"],
    Alerting: "Running",
    Stopping: "Stopped",
    Stopped: "Exit",
    Exit: [],
  };

  #state: StateName = "0";

  #stateListeners: StateListeners = {
    0: [],
    Starting: [],
    Started: [],
    Running: [],
    Alerting: [],
    Stopping: [],
    Stopped: [],
    Exit: [],
  };

  async action<S extends StateName>(
    newState: S,
    ...data: Parameters<States[S]>
  ): Promise<void> {
    const newStates = this.#fsm[this.#state];

    if (Array.isArray(newStates)) {
      if (!newStates.includes(newState)) {
        await std.log.error(
          { state: this.#state, newState },
          "Invalid state->newState",
        );
        return;
      }

      await std.log.info({ state: this.#state, newState }, "Transition");
      this.#state = newState;

      await this.#runStateListeners(data);
    }

    while (true) {
      const newStates = this.#fsm[this.#state];
      if (typeof newStates !== "string") {
        break;
      }

      await std.log.info(
        { state: this.#state, newState: newStates },
        "Transition",
      );
      this.#state = newStates;

      await this.#runStateListeners(data);
    }
  }

  onState<S extends StateName>(state: S, name: string, fn: States[S]): void {
    this.#stateListeners[state].push({ name, fn });
  }

  async #runStateListeners(data: unknown[]): Promise<void> {
    for (const x of this.#stateListeners[this.#state]) {
      await std.log.info({ state: this.#state, listener: x.name }, "Running");
      const fn = x.fn as (..._: unknown[]) => Promise<void>;
      await fn(...data);
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
