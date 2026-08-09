import * as files from "@libs/files";

import * as alert from "@plugins/alert";
import * as buffer from "@plugins/buffer";
import * as confirm from "@plugins/confirm";
import * as core from "@plugins/core";
import * as saveAs from "@plugins/save-as";

export type API = {
  file: File;
};

export function Plugin(
  api:
    & core.API
    & buffer.API
    & confirm.API
    & alert.API
    & saveAs.API,
): API {
  return {
    file: new File(api),
  };
}

class File {
  constructor(
    private readonly api:
      & core.API
      & buffer.API
      & confirm.API
      & alert.API
      & saveAs.API,
  ) {
  }

  async open(newFileName: string): Promise<void> {
    this.api.buffer.name = newFileName;

    try {
      await this.api.buffer.load(files.load(newFileName));
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

  async save(): Promise<void> {
    if (!this.api.buffer.name) {
      await this.saveAs();
      return;
    }

    try {
      await files.save(this.api.buffer.name, this.api.buffer.chunks);

      this.api.buffer.resetHistory();
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await this.api.alert.open(message);

      await this.saveAs();
    }
  }

  async saveAs(): Promise<void> {
    while (true) {
      const newFileName = await this.api.saveAs.open(this.api.buffer.name);
      if (!newFileName) {
        return;
      }

      try {
        await files.save(newFileName, this.api.buffer.chunks);

        this.api.buffer.resetHistory();

        this.api.buffer.name = newFileName;

        return;
      } catch (err) {
        const message = Error.isError(err) ? err.message : Deno.inspect(err);
        await this.api.alert.open(message);
      }
    }
  }
}
