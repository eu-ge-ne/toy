import * as files from "@libs/files";

import * as alertModal from "@plugins/alert-modal";
import * as buffers from "@plugins/buffers";
import * as confirmModal from "@plugins/confirm-modal";
import * as fileNameModal from "@plugins/file-name-modal";
import * as runtime from "@plugins/runtime";

export type API = {
  main: {
    open(_: string): Promise<void>;
    save(): Promise<void>;
    saveAs(): Promise<void>;
  };
};

export function plugin(
  api: buffers.API & runtime.API & confirmModal.API & alertModal.API & fileNameModal.API,
): API {
  async function open(newFileName: string): Promise<void> {
    api.buffer.name = newFileName;

    try {
      await api.buffer.rewrite(files.load(newFileName));
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        // ignore
      } else {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await api.alertModal.open(message);

        await api.runtime.stop();
      }
    }
  }

  async function save(): Promise<void> {
    if (!api.buffer.name) {
      await saveAs();
      return;
    }

    try {
      await files.save(api.buffer.name, api.buffer.read());

      api.buffer.resetUndo();
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await api.alertModal.open(message);

      await saveAs();
    }
  }

  async function saveAs(): Promise<void> {
    while (true) {
      const newFileName = await api.fileNameModal.open(api.buffer.name);
      if (!newFileName) {
        return;
      }

      try {
        await files.save(newFileName, api.buffer.read());

        api.buffer.resetUndo();

        api.buffer.name = newFileName;
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await api.alertModal.open(message);
      }
    }
  }

  return {
    main: {
      open,
      save,
      saveAs,
    },
  };
}
