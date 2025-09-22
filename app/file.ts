import * as file from "@lib/file";

import { App } from "./app.ts";

export class File {
  #file_path = "";

  constructor(private readonly app: App) {
  }

  async open(file_path: string): Promise<void> {
    try {
      await file.load(file_path, this.app.editor.buffer);

      this.#set_file_path(file_path);
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.app.alert.open(err);

        this.app.exit();
      }
    }
  }

  async save(): Promise<boolean> {
    if (this.#file_path) {
      return await this.#save_file();
    } else {
      return await this.#save_file_as();
    }
  }

  async #save_file(): Promise<boolean> {
    try {
      await file.save(this.#file_path, this.app.editor.buffer);

      return true;
    } catch (err) {
      await this.app.alert.open(err);

      return await this.#save_file_as();
    }
  }

  async #save_file_as(): Promise<boolean> {
    while (true) {
      const file_path = await this.app.saveas.open(this.#file_path);
      if (!file_path) {
        return false;
      }

      try {
        await file.save(file_path, this.app.editor.buffer);

        this.#set_file_path(file_path);

        return true;
      } catch (err) {
        await this.app.alert.open(err);
      }
    }
  }

  #set_file_path(file_path: string): void {
    this.#file_path = file_path;

    this.app.header.set_file_path(file_path);
  }
}
