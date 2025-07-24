import { Action } from "./action.ts";
import { exit } from "./exit.ts";

export class LoadAction extends Action {
  protected override async _run(): Promise<void> {
    const { editor, alert, args } = this.app;

    if (typeof args._[0] !== "string") {
      return;
    }

    const path = args._[0];

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
