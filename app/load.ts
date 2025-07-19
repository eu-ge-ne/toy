import { Action } from "./action.ts";
import { exit } from "./exit.ts";

export class LoadAction extends Action<[string, Promise<string>]> {
  async run(path: string, text: Promise<string>): Promise<void> {
    const { editor, alert } = this.app;

    try {
      editor.buf.set_text(await text);
      editor.reset();

      this.app.set_file_path(path);
    } catch (err) {
      await alert.open(err);

      exit();
    }
  }
}
