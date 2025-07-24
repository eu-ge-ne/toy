import { App } from "./app.ts";

export abstract class Action {
  constructor(protected app: App) {
  }

  async run(): Promise<void> {
    const started = Date.now();

    const { editor, debug } = this.app;

    try {
      this.app.action_running = true;
      editor.enabled = false;

      await this._run();
    } finally {
      this.app.action_running = false;
      editor.enabled = true;

      this.app.render();

      debug.set_react_time(Date.now() - started);
    }
  }

  protected abstract _run(): Promise<void>;
}
