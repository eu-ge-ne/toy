import { Action } from "./action.ts";

export class SaveAction extends Action<[]> {
  async run(): Promise<void> {
    const { editor, file_path, alert, action } = this.app;

    if (file_path.length === 0) {
      await action.save_as.run();
      return;
    }

    try {
      await editor.buffer.save(file_path);

      editor.reset();
    } catch (err) {
      await alert.open(err);

      this.app.render();

      await action.save_as.run();
    }
  }
}
