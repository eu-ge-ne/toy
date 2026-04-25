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
type State = {
  outs?: StateName[];
  defaultOut?: StateName;
};

type FSM = Record<StateName, State>;

type EntryActions = {
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
    0: { outs: ["Starting"] },
    Starting: { defaultOut: "Started" },
    Started: { defaultOut: "Running" },
    Running: { outs: ["Stopping"] },
    Stopping: { outs: ["Alerting"], defaultOut: "Stopped" },
    Stopped: { defaultOut: "Exit" },
    Alerting: {},
    Exit: {},
  };

  #state: StateName[] = ["0"];

  #actions: EntryActions = {
    0: [],
    Starting: [],
    Started: [],
    Running: [],
    Alerting: [],
    Stopping: [],
    Stopped: [],
    Exit: [],
  };

  async transition<S extends StateName>(
    newState: S,
    ...data: Parameters<States[S]>
  ): Promise<void> {
    const outs = this.#fsm[this.#state[0]!].outs;
    if (!outs?.includes(newState)) {
      await std.log.error(
        { state: this.#state[0], newState },
        "Invalid state transition",
      );
      return;
    }

    await this.#transition(newState, data);
    if (this.#state[0] !== newState) {
      return;
    }

    await this.#transitionDefaults();
  }

  async return(): Promise<void> {
    await std.log.info(
      { state: this.#state[0], return: this.#state[1] },
      "State return",
    );
    this.#state.shift();
    await this.#transitionDefaults();
  }

  onEntry<S extends StateName>(state: S, name: string, fn: States[S]): void {
    this.#actions[state].push({ name, fn });
  }

  async #transition<S extends StateName>(
    newState: S,
    data: Parameters<States[S]>,
  ): Promise<void> {
    await std.log.info({ state: this.#state[0], newState }, "State transition");
    this.#state.unshift(newState);
    await this.#runEntryActions(data);
  }

  async #transitionDefaults(): Promise<void> {
    while (true) {
      const defaultState = this.#fsm[this.#state[0]!].defaultOut;
      if (!defaultState) {
        break;
      }
      await this.#transition(defaultState, []);
    }
  }

  async #runEntryActions(data: unknown[]): Promise<void> {
    for (const x of this.#actions[this.#state[0]!]) {
      await std.log.info(
        { state: this.#state[0], listener: x.name },
        "Running",
      );
      const fn = x.fn as (..._: unknown[]) => Promise<void>;
      await fn(...data);
    }
  }

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
