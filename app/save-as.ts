import { Action } from "./action.ts";

export class SaveAsAction extends Action {
  protected override async _run(): Promise<void> {
    const { file_path, ui } = this.app;

    while (true) {
      const path = await ui.save_as.open(file_path);
      if (!path) {
        return;
      }

      try {
        using file = await Deno.open(path, {
          create: true,
          write: true,
          truncate: true,
        });

        await ui.editor.buffer.save(file);

        ui.editor.reset(false);

        this.app.set_file_path(path);
      } catch (err) {
        await ui.alert.open(err);

        this.app.render();
        continue;
      }

      return;
    }
  }
}
