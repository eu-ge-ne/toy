import * as files from "@libs/files";
import * as plugins from "@libs/plugins";

export class FilesPlugin {
  #fileName?: string;

  constructor(private readonly host: plugins.Host) {
  }

  async open(fileName: string): Promise<void> {
    try {
      for await (const chunk of files.load(fileName)) {
        this.host.doc.write(chunk);
      }

      this.host.doc.reset();

      this.host.statusDocName(fileName);

      this.#fileName = fileName;
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.host.alert.open(message);

        await this.host.stop();
      }
    }
  }

  async save(): Promise<void> {
    if (!this.#fileName) {
      await this.host.files.saveAs();
      return;
    }

    try {
      await files.save(this.#fileName, this.host.doc.read());

      this.host.doc.reset();
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await this.host.alert.open(message);

      await this.host.files.saveAs();
    }
  }

  async saveAs(): Promise<void> {
    while (true) {
      const newFileName = await this.host.askFileName.open(
        this.#fileName ?? "",
      );
      if (!newFileName) {
        return;
      }

      try {
        await files.save(newFileName, this.host.doc.read());

        this.#fileName = newFileName;
        this.host.statusDocName(newFileName);

        this.host.doc.reset();
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.host.alert.open(message);
      }
    }
  }
}
