import * as files from "@libs/files";
import * as plugins from "@libs/plugins";

export class FilePlugin extends plugins.Plugin {
  #fileName?: string;

  override async onOpenFile(fileName: string): Promise<void> {
    try {
      for await (const chunk of files.load(fileName)) {
        this.host.emitDocAppend(chunk);
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
