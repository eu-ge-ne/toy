import * as files from "@libs/files";
import * as plugins from "@libs/plugins";

export function register(host: plugins.Host): void {
  let fileName: string | undefined;

  host.registerFiles({
    async open(newFileName: string): Promise<void> {
      try {
        for await (const chunk of files.load(newFileName)) {
          host.doc.write(chunk);
        }

        host.doc.reset();

        host.statusDocName(newFileName);

        fileName = newFileName;
      } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await host.alert.open(message);

          await host.emitStop();
        }
      }
    },

    async save(): Promise<void> {
      if (!fileName) {
        await host.files.saveAs();
        return;
      }

      try {
        await files.save(fileName, host.doc.read());

        host.doc.reset();
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await host.alert.open(message);

        await host.files.saveAs();
      }
    },

    async saveAs(): Promise<void> {
      while (true) {
        const newFileName = await host.askFileName.open(fileName ?? "");
        if (!newFileName) {
          return;
        }

        try {
          await files.save(newFileName, host.doc.read());

          fileName = newFileName;
          host.statusDocName(newFileName);

          host.doc.reset();
        } catch (err) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await host.alert.open(message);
        }
      }
    },
  });
}
