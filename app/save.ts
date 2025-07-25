import { Action } from "./action.ts";

export class SaveAction extends Action {
  protected override async _run(): Promise<void> {
    const { file_path, ui, action } = this.app;

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

      await ui.editor.buffer.save(file);

      ui.editor.reset(false);
    } catch (err) {
      await ui.alert.open(err);

      this.app.render();

      await action.save_as.run();
    }
  }
}
