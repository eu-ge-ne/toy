import * as files from "@libs/files";

import { AlertAPI } from "@plugins/alert";
import { BufferAPI } from "@plugins/buffer";
import { ConfirmAPI } from "@plugins/confirm";
import { CoreAPI } from "@plugins/core";
import { SaveAsAPI } from "@plugins/save-as";

export type FileAPI = ReturnType<typeof FilePlugin>;

export function FilePlugin(...api: ConstructorParameters<typeof File>) {
  return {
    file: new File(...api),
  };
}

class File {
  constructor(
    private readonly api:
      & CoreAPI
      & BufferAPI
      & ConfirmAPI
      & AlertAPI
      & SaveAsAPI,
  ) {
  }

  async open(newFileName: string) {
    this.api.buffer.name = newFileName;

    try {
      await this.api.buffer.rewrite(files.load(newFileName));
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        // ignore
      } else {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.api.alert.open(message);

        await this.api.core.stop();
      }
    }
  }

  async save() {
    if (!this.api.buffer.name) {
      await this.saveAs();
      return;
    }

    try {
      await files.save(this.api.buffer.name, this.api.buffer.read());

      this.api.buffer.resetUndo();
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await this.api.alert.open(message);

      await this.saveAs();
    }
  }

  async saveAs() {
    while (true) {
      const newFileName = await this.api.saveAs.open(this.api.buffer.name);
      if (!newFileName) {
        return;
      }

      try {
        await files.save(newFileName, this.api.buffer.read());

        this.api.buffer.resetUndo();

        this.api.buffer.name = newFileName;
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.api.alert.open(message);
      }
    }
  }
}
