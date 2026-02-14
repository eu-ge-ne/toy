import { Alert } from "@components/alert";
import { Ask } from "@components/ask";
import { Debug } from "@components/debug";
import { Editor } from "@components/editor";
import { Footer } from "@components/footer";
import { Header } from "@components/header";
import { Palette } from "@components/palette";
import { Save } from "@components/save";
import { Command, ShortcutToCommand } from "@lib/commands";
import * as file from "@lib/file";
import * as kitty from "@lib/kitty";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { IRoot } from "./root.ts";

export type { IRoot } from "./root.ts";

export class Root extends Component implements IRoot {
  isLayoutDirty = false;
  zen = true;

  filePath = "";
  isDirty = false;
  inputTime = 0;
  renderTime = 0;
  ln = 0;
  col = 0;
  lnCount = 0;

  #children: {
    header: Header;
    editor: Editor;
    footer: Footer;
    debug: Debug;
    palette: Palette;
    alert: Alert;
    ask: Ask;
    save: Save;
  };

  constructor() {
    super(() => {
      const { columns, rows } = Deno.consoleSize();
      this.w = columns;
      this.h = rows;

      this.#children.header.layout(this);
      this.#children.footer.layout(this);
      this.#children.editor.layout(this);

      const p = this.#children.editor;
      this.#children.debug.layout(p);
      this.#children.palette.layout(p);
      this.#children.alert.layout(p);
      this.#children.ask.layout(p);
      this.#children.save.layout(p);
    });

    this.#children = {
      header: new Header(this),
      editor: new Editor(this, { multiLine: true }, (a, p) => {
        if (this.zen) {
          a.y = p.y;
          a.x = p.x;
          a.w = p.w;
          a.h = p.h;
        } else {
          a.y = p.y + 1;
          a.x = p.x;
          a.w = p.w;
          a.h = p.h - 2;
        }
      }),
      footer: new Footer(this),
      debug: new Debug(this),
      palette: new Palette(this),
      alert: new Alert(this),
      ask: new Ask(this),
      save: new Save(this),
    };
  }

  async run(fileName?: string): Promise<void> {
    this.#children.editor.enable(true);
    this.#children.editor.history.onChange = () =>
      this.isDirty = !this.#children.editor.history.isEmpty;

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#onSigwinch);

    if (fileName) {
      await this.#open(fileName);
    }

    this.#children.editor.reset(true);

    this.layout(this);
    this.render();

    await this.#processInput();
  }

  render(): void {
    const t0 = performance.now();

    vt.sync.bsu();

    this.#children.header.render();
    this.#children.footer.render();
    this.#children.editor.render();
    this.#children.debug.render();
    this.#children.palette.render();
    this.#children.alert.render();
    this.#children.ask.render();
    this.#children.save.render();

    vt.sync.esu();

    this.renderTime = performance.now() - t0;
  }

  async #processInput(): Promise<void> {
    while (true) {
      const key = await vt.readKey();

      this.isLayoutDirty = false;

      const cmdName = ShortcutToCommand[kitty.shortcut(key)];
      if (typeof cmdName !== "undefined") {
        const cmd = { name: cmdName } as Command;
        await this.handleTree(cmd);
      } else {
        this.#children.editor.handleKey(key);
      }

      if (this.isLayoutDirty) {
        this.layout(this);
      }
      this.render();
    }
  }

  async handle(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Zen":
        this.zen = !this.zen;
        break;

      case "Exit":
        await this.#handleExit();
        break;

      case "Palette":
        await this.#handlePalette();
        break;

      case "Save":
        await this.#handleSave();
        break;
    }
  }

  async handleTree(cmd: Command): Promise<void> {
    await this.handle(cmd);
    await this.#children.header.handle(cmd);
    await this.#children.footer.handle(cmd);
    await this.#children.editor.handle(cmd);
    await this.#children.debug.handle(cmd);
    await this.#children.palette.handle(cmd);
    await this.#children.alert.handle(cmd);
    await this.#children.ask.handle(cmd);
    await this.#children.save.handle(cmd);
  }

  async #handleExit(): Promise<void> {
    this.#children.editor.enable(false);

    if (!this.#children.editor.history.isEmpty) {
      if (await this.#children.ask.run("Save changes?")) {
        await this.#save();
      }
    }

    this.#exit();
  }

  async #handlePalette(): Promise<void> {
    this.#children.editor.enable(false);

    const cmd = await this.#children.palette.run();

    this.#children.editor.enable(true);

    this.render();

    if (cmd) {
      await this.handleTree(cmd);
    }
  }

  async #handleSave(): Promise<void> {
    this.#children.editor.enable(false);

    if (await this.#save()) {
      this.#children.editor.reset(false);
    }

    this.#children.editor.enable(true);

    this.render();
  }

  async #open(filePath: string): Promise<void> {
    try {
      await file.load(this.#children.editor.textBuf, filePath);

      this.filePath = filePath;
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.#children.alert.run(err);

        this.#exit();
      }
    }
  }

  async #save(): Promise<boolean> {
    if (this.filePath) {
      return await this.#saveFile();
    } else {
      return await this.#saveFileAs();
    }
  }

  async #saveFile(): Promise<boolean> {
    try {
      await file.save(this.#children.editor.textBuf, this.filePath);

      return true;
    } catch (err) {
      await this.#children.alert.run(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    while (true) {
      const filePath = await this.#children.save.run(this.filePath);
      if (!filePath) {
        return false;
      }

      try {
        await file.save(this.#children.editor.textBuf, filePath);

        this.filePath = filePath;

        return true;
      } catch (err) {
        await this.#children.alert.run(err);
      }
    }
  }

  #onSigwinch = () => {
    this.layout(this);
    this.render();
  };

  #exit = (e?: PromiseRejectionEvent) => {
    vt.restore();

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  };
}
