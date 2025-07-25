import { App } from "../app.ts";

export abstract class Action<P extends unknown[] = []> {
  constructor(protected app: App) {
  }

  async run(...p: P): Promise<void> {
    const started = Date.now();

    try {
      this.app.actions_started += 1;

      await this._run(...p);
    } finally {
      this.app.actions_started -= 1;

      this.app.ui.debug.set_action_time(Date.now() - started);
    }
  }

  protected abstract _run(...p: P): Promise<void>;
}
