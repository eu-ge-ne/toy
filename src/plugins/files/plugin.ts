import * as files from "@libs/files";
import * as plugins from "@libs/plugins";

export default {
  register(api: plugins.Api): void {
    let fileName: string | undefined;

    api.registerFiles({
      async open(newFileName: string): Promise<void> {
        try {
          for await (const chunk of files.load(newFileName)) {
            api.doc.write(chunk);
          }

          api.doc.reset();

          api.statusDocName(newFileName);

          fileName = newFileName;
        } catch (err) {
          if (!(err instanceof Deno.errors.NotFound)) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alert.open(message);

            await api.emitStop();
          }
        }
      },

      async save(): Promise<void> {
        if (!fileName) {
          await api.files.saveAs();
          return;
        }

        try {
          await files.save(fileName, api.doc.read());

          api.doc.reset();
        } catch (err) {
          const message = Error.isError(err) ? err.message : Deno.inspect(err);
          await api.alert.open(message);

          await api.files.saveAs();
        }
      },

      async saveAs(): Promise<void> {
        while (true) {
          const newFileName = await api.askFileName.open(fileName ?? "");
          if (!newFileName) {
            return;
          }

          try {
            await files.save(newFileName, api.doc.read());

            fileName = newFileName;
            api.statusDocName(newFileName);

            api.doc.reset();
          } catch (err) {
            const message = Error.isError(err)
              ? err.message
              : Deno.inspect(err);
            await api.alert.open(message);
          }
        }
      },
    });
  },
};
