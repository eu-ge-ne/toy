import { Action } from "./action.ts";

export class SaveAsAction extends Action<[]> {
  async run(): Promise<void> {
    const { editor, file_path, alert, save_as } = this.app;

    while (true) {
      const path = await save_as.open(file_path);
      if (path.length === 0) {
        return;
      }

      try {
        await editor.buffer.save(file_path);

        editor.reset(false);

        this.app.set_file_path(path);
      } catch (err) {
        await alert.open(err);

        this.app.render();
        continue;
      }

      return;
    }
  }
}
