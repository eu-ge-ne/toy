import { App } from "./app.ts";

export abstract class Action {
  constructor(protected app: App) {
  }

  async run(): Promise<void> {
    const started = Date.now();

    const { editor, debug } = this.app.ui;

    try {
      this.app.actions_started += 1;
      editor.enabled = false;

      await this._run();
    } finally {
      this.app.actions_started -= 1;
      editor.enabled = true;

      this.app.render();

      debug.set_react_time(Date.now() - started);
    }
  }

  protected abstract _run(): Promise<void>;
}
