import { Action } from "./action.ts";
import { exit } from "./exit.ts";

export class LoadAction extends Action {
  protected override async _run(): Promise<void> {
    const { args, ui } = this.app;

    const path = args._[0];

    if (typeof path !== "string") {
      return;
    }

    try {
      using file = await Deno.open(path, { read: true });

      const info = await file.stat();
      if (!info.isFile) {
        throw new Error(`${path} is not a file`);
      }

      await ui.editor.buffer.load(file);

      ui.editor.reset(true);

      this.app.set_file_path(path);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        this.app.set_file_path(path);
      } else {
        await ui.alert.open(err);

        exit();
      }
    }
  }
}
