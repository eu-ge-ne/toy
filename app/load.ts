import { Action } from "./action.ts";
import { exit } from "./exit.ts";

export class LoadAction extends Action<[unknown]> {
  async run(path: unknown): Promise<void> {
    if (typeof path !== "string") {
      return;
    }

    const { editor, alert } = this.app;

    try {
      using file = await Deno.open(path, { read: true });

      const info = await file.stat();
      if (!info.isFile) {
        throw new Error(`${path} is not a file`);
      }

      await editor.buffer.load(file);

      editor.reset(true);

      this.app.set_file_path(path);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        this.app.set_file_path(path);
      } else {
        await alert.open(err);

        exit();
      }
    }
  }
}
