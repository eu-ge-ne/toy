import * as files from "@libs/files";

import { AlertModalAPI } from "@plugins/alert-modal";
import { BufferAPI } from "@plugins/buffer";
import { ConfirmModalAPI } from "@plugins/confirm-modal";
import { CoreAPI } from "@plugins/core";
import { FileNameModalAPI } from "@plugins/file-name-modal";

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
      & ConfirmModalAPI
      & AlertModalAPI
      & FileNameModalAPI,
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
        await this.api.alertModal.open(message);

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
      await this.api.alertModal.open(message);

      await this.saveAs();
    }
  }

  async saveAs() {
    while (true) {
      const newFileName = await this.api.fileNameModal.open(this.api.buffer.name);
      if (!newFileName) {
        return;
      }

      try {
        await files.save(newFileName, this.api.buffer.read());

        this.api.buffer.resetUndo();

        this.api.buffer.name = newFileName;
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.api.alertModal.open(message);
      }
    }
  }
}
