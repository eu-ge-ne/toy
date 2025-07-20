import { Action } from "./action.ts";
import { exit } from "./exit.ts";

export class LoadAction extends Action<[string]> {
  async run(path: string): Promise<void> {
    const { editor, alert } = this.app;

    try {
      using file = await Deno.open(path, { read: true });

      const info = await file.stat();
      if (!info.isFile) {
        throw new Error(`${path} not found`);
      }

      const stream = file.readable.pipeThrough(new TextDecoderStream());

      await editor.buffer.pipe_from(stream);

      editor.reset();

      this.app.set_file_path(path);
    } catch (err) {
      await alert.open(err);

      exit();
    }
  }
}
