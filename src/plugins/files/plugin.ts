import * as plugins from "@libs/plugins";

import { loadFile, saveFile } from "./files.ts";

export class FilesPlugin extends plugins.Plugin {
  #fileName?: string;

  async open(fileName: string): Promise<void> {
    try {
      for await (const chunk of loadFile(fileName)) {
        this.host.emitDocWrite(chunk);
      }

      this.host.emitDocNameChange(fileName);

      this.#fileName = fileName;
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.host.alert.open(message);

        await this.host.emitStop();
      }
    }
  }

  async save(): Promise<boolean> {
    if (!this.#fileName) {
      return await this.host.files.saveAs();
    }

    try {
      await saveFile(this.#fileName, this.host.emitDocRead());

      return true;
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await this.host.alert.open(message);

      return await this.host.files.saveAs();
    }
  }

  async saveAs(): Promise<boolean> {
    while (true) {
      const newFileName = await this.host.askFileName.open(
        this.#fileName ?? "",
      );
      if (!newFileName) {
        return false;
      }

      try {
        await saveFile(newFileName, this.host.emitDocRead());

        this.#fileName = newFileName;
        this.host.emitDocNameChange(newFileName);

        return true;
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.host.alert.open(message);
      }
    }
  }
}
