import { App } from "./app.ts";

// deno-lint-ignore no-explicit-any
export abstract class Action<P extends any[], R = void> {
  constructor(protected app: App) {
  }

  abstract run(...p: P): Promise<R> | R;
}
