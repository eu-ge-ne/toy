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
import { clamp } from "@lib/std";
import { Component } from "@lib/ui";
import * as vt from "@lib/vt";

import { IRoot } from "./root.ts";

export type { IRoot } from "./root.ts";

export class Root extends Component implements IRoot {
  isLayoutDirty = false;
  zen = true;

  filePath = "";
  isDirty = false;

  override children: {
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
    super();

    this.children = {
      header: new Header(this, { zen: this.zen }),
      editor: new Editor(this, { zen: this.zen, multiLine: true }),
      footer: new Footer(this, { zen: this.zen, ln: 0, col: 0, lnCount: 0 }),
      debug: new Debug({ renderTime: 0, inputTime: 0 }),
      palette: new Palette(this),
      alert: new Alert(this),
      ask: new Ask(this),
      save: new Save(this),
    };

    this.children.editor.on("cursorChanged", (data) => {
      const s = this.children.footer.state;
      s.ln = data.ln;
      s.col = data.col;
      s.lnCount = data.lnCount;
    });

    this.children.editor.on(
      "inputHandled",
      (data) => this.children.debug.state.inputTime = data,
    );
  }

  async run(fileName?: string): Promise<void> {
    this.children.editor.enable(true);
    this.children.editor.history.onChange = () =>
      this.isDirty = !this.children.editor.history.isEmpty;

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#onSigwinch);

    if (fileName) {
      await this.#open(fileName);
    }

    this.children.editor.reset(true);

    this.resizeChildren();
    this.render();

    await this.#processInput();
  }

  override resizeChildren(): void {
    const { columns, rows } = Deno.consoleSize();
    this.width = columns;
    this.height = rows;

    this.children.header.resize(this.width, 1, this.y, this.x);
    this.children.footer.resize(
      this.width,
      1,
      this.y + this.height - 1,
      this.x,
    );
    {
      let w, h, y, x: number;
      if (this.zen) {
        w = this.width;
        h = this.height;
        y = this.y;
        x = this.x;
      } else {
        w = this.width;
        h = this.height - 2;
        y = this.y + 1;
        x = this.x;
      }
      this.children.editor.resize(w, h, y, x);
    }

    const p = this.children.editor;
    {
      const w = clamp(30, 0, p.width);
      const h = clamp(7, 0, p.height);
      const y = p.y + p.height - h;
      const x = p.x + p.width - w;
      this.children.debug.resize(w, h, y, x);
    }
    this.children.palette.resize(p.width, p.height, p.y, p.x);
    {
      const w = clamp(60, 0, p.width);
      const h = clamp(10, 0, p.height);
      const y = p.y + Math.trunc((p.height - h) / 2);
      const x = p.x + Math.trunc((p.width - w) / 2);
      this.children.alert.resize(w, h, y, x);
    }
    {
      const w = clamp(60, 0, p.width);
      const h = clamp(7, 0, p.height);
      const y = p.y + Math.trunc((p.height - h) / 2);
      const x = p.x + Math.trunc((p.width - w) / 2);
      this.children.ask.resize(w, h, y, x);
    }
    {
      const w = clamp(60, 0, p.width);
      const h = clamp(10, 0, p.height);
      const y = p.y + Math.trunc((p.height - h) / 2);
      const x = p.x + Math.trunc((p.width - w) / 2);
      this.children.save.resize(w, h, y, x);
    }
  }

  render(): void {
    const t0 = performance.now();

    if (this.isLayoutDirty) {
      this.resizeChildren();
      this.isLayoutDirty = false;
    }

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    this.children.header.render();
    this.children.footer.render();
    this.children.editor.render();
    this.children.debug.render();
    this.children.palette.render();
    this.children.alert.render();
    this.children.ask.render();
    this.children.save.render();

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    this.children.debug.state.renderTime = performance.now() - t0;
  }

  override handleKey(key: kitty.Key): boolean {
    for (const child of Object.values(this.children)) {
      const handled = child.handleKey(key);
      if (handled) {
        return true;
      }
    }
    return false;
  }

  override async handleCommand(cmd: Command): Promise<void> {
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

    for (const child of Object.values(this.children)) {
      await child.handleCommand(cmd);
    }
  }

  async #processInput(): Promise<void> {
    while (true) {
      const key = await vt.readKey();

      const cmdName = ShortcutToCommand[kitty.shortcut(key)];
      if (typeof cmdName !== "undefined") {
        const cmd = { name: cmdName } as Command;
        await this.handleCommand(cmd);
      } else {
        this.handleKey(key);
      }

      this.render();
    }
  }

  async #handleExit(): Promise<void> {
    this.children.editor.enable(false);

    if (!this.children.editor.history.isEmpty) {
      if (await this.children.ask.run("Save changes?")) {
        await this.#save();
      }
    }

    this.#exit();
  }

  async #handlePalette(): Promise<void> {
    this.children.editor.enable(false);

    const cmd = await this.children.palette.run();

    this.children.editor.enable(true);

    this.render();

    if (cmd) {
      await this.handleCommand(cmd);
    }
  }

  async #handleSave(): Promise<void> {
    this.children.editor.enable(false);

    if (await this.#save()) {
      this.children.editor.reset(false);
    }

    this.children.editor.enable(true);

    this.render();
  }

  async #open(filePath: string): Promise<void> {
    try {
      await file.load(this.children.editor.textBuf, filePath);

      this.filePath = filePath;
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.children.alert.run(err);

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
      await file.save(this.children.editor.textBuf, this.filePath);

      return true;
    } catch (err) {
      await this.children.alert.run(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    while (true) {
      const filePath = await this.children.save.run(this.filePath);
      if (!filePath) {
        return false;
      }

      try {
        await file.save(this.children.editor.textBuf, filePath);

        this.filePath = filePath;

        return true;
      } catch (err) {
        await this.children.alert.run(err);
      }
    }
  }

  #onSigwinch = () => {
    this.resizeChildren();
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
