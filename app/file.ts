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

  async save(): Promise<void> {
    try {
      this.app.editor.enabled = false;

      if (this.#file_path) {
        await this.#save_file();
      } else {
        await this.#save_file_as();
      }
    } finally {
      this.app.editor.enabled = true;

      this.app.editor.render();
    }
  }

  async #save_file(): Promise<void> {
    try {
      await file.save(this.#file_path, this.app.editor.buffer);

      this.app.editor.reset(false);
    } catch (err) {
      await this.app.alert.open(err);

      await this.#save_file_as();
    }
  }

  async #save_file_as(): Promise<void> {
    while (true) {
      const file_path = await this.app.saveas.open(this.#file_path);
      if (!file_path) {
        return;
      }

      try {
        await file.save(file_path, this.app.editor.buffer);

        this.app.editor.reset(false);

        this.#set_file_path(file_path);
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
