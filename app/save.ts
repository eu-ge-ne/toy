import { Action } from "./action.ts";

export class SaveAction extends Action<[]> {
  async run(): Promise<void> {
    const { editor, file_path, alert, action } = this.app;

    if (!file_path) {
      await action.save_as.run();
      return;
    }

    try {
      using file = await Deno.open(file_path, {
        create: true,
        write: true,
        truncate: true,
      });

      await editor.buffer.save(file);

      editor.reset(false);
    } catch (err) {
      await alert.open(err);

      this.app.render();

      await action.save_as.run();
    }
  }
}
