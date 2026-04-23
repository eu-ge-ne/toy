import * as plugins from "@libs/plugins";

import { loadFile } from "./files.ts";

export class FilesPlugin extends plugins.Plugin {
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

        this.host.emitStop();
      }
    }
  }
}
