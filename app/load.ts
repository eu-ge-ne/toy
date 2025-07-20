import { Action } from "./action.ts";
import { exit } from "./exit.ts";

export class LoadAction extends Action<[string]> {
  async run(path: string): Promise<void> {
    const { editor, alert } = this.app;

    try {
      await editor.buffer.load(path);

      editor.reset();

      this.app.set_file_path(path);
    } catch (err) {
      await alert.open(err);

      exit();
    }
  }
}
