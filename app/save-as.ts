import { Action } from "./action.ts";

export class SaveAsAction extends Action {
  protected override async _run(): Promise<void> {
    const { editor, file_path, alert, save_as } = this.app;

    while (true) {
      const new_path = await save_as.open(file_path);
      if (!new_path) {
        return;
      }

      try {
        using file = await Deno.open(new_path, {
          create: true,
          write: true,
          truncate: true,
        });

        await editor.buffer.save(file);

        editor.reset(false);

        this.app.set_file_path(new_path);
      } catch (err) {
        await alert.open(err);

        this.app.render();
        continue;
      }

      return;
    }
  }
}
