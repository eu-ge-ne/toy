import * as plugins from "@libs/plugins";

import { loadFile, saveFile } from "./files.ts";

export class FilesPlugin extends plugins.Plugin {
  protected name = "Files";

  #fileName?: string;

  override async onFileOpen(fileName: string): Promise<void> {
    try {
      for await (const chunk of loadFile(fileName)) {
        this.host.emitDocWrite(chunk);
      }

      this.host.emitDocNameChange(fileName);

      this.#fileName = fileName;
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.host.emitAlert(message);

        await this.host.action("Stop");
      }
    }
  }

  override async onFileSave(): Promise<boolean> {
    if (!this.#fileName) {
      return await this.host.emitFileSaveAs();
    }

    try {
      await saveFile(this.#fileName, this.host.emitDocRead());

      return true;
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await this.host.emitAlert(message);

      return await this.host.emitFileSaveAs();
    }
  }

  override async onFileSaveAs(): Promise<boolean> {
    while (true) {
      const newFileName = await this.host.emitAskFileName(this.#fileName ?? "");
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
        await this.host.emitAlert(message);
      }
    }
  }
}
