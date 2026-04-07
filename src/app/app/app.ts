import { Alert } from "@app/alert";
import { Ask } from "@app/ask";
import { Debug } from "@app/debug";
import { Editor } from "@app/editor";
import { Footer } from "@app/footer";
import { Header } from "@app/header";
import { Palette } from "@app/palette";
import { Save } from "@app/save";
import { Command, ShortcutToCommand } from "@lib/commands";
import * as file from "@lib/file";
import * as kitty from "@lib/kitty";
import { clamp } from "@lib/std";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

export class App extends ui.Component {
  #zen = true;
  #fileName = "";
  #fileModified = false;

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

    const { editor, palette, alert, ask, save } = this.children = {
      header: new Header({
        disabled: this.#zen,
        fileName: this.#fileName,
        fileModified: this.#fileModified,
      }),
      footer: new Footer({
        disabled: this.#zen,
        ln: 0,
        col: 0,
        lnCount: 0,
      }),
      editor: new Editor({
        disabled: false,
        index: !this.#zen,
        multiLine: true,
        whitespace: false,
        wrap: false,
      }),
      debug: new Debug({
        disabled: true,
        renderTime: 0,
        inputTime: 0,
      }),
      palette: new Palette(),
      alert: new Alert(),
      ask: new Ask(),
      save: new Save(),
    };

    palette.on("layoutChange", () => this.resizeChildren());

    alert.on("render", () => this.render());
    ask.on("render", () => this.render());
    palette.on("render", () => this.render());
    save.on("render", () => this.render());

    editor.on("cursorChanged", (data) => {
      const x = this.children.footer.state;
      x.ln = data.ln;
      x.col = data.col;
      x.lnCount = data.lnCount;
    });

    editor.on(
      "inputHandled",
      (data) => this.children.debug.state.inputTime = data,
    );
  }

  override resizeChildren(): void {
    const { header, footer, editor, debug, palette, alert, ask, save } =
      this.children;

    header.resize(this.width, 1, this.y, this.x);
    footer.resize(this.width, 1, this.y + this.height - 1, this.x);
    {
      let w, h, y, x: number;
      if (this.#zen) {
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
      editor.resize(w, h, y, x);
    }
    {
      const w = clamp(30, 0, editor.width);
      const h = clamp(7, 0, editor.height);
      const y = editor.y + editor.height - h;
      const x = editor.x + editor.width - w;
      debug.resize(w, h, y, x);
    }
    palette.resize(editor.width, editor.height, editor.y, editor.x);
    {
      const w = clamp(60, 0, editor.width);
      const h = clamp(10, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      alert.resize(w, h, y, x);
    }
    {
      const w = clamp(60, 0, editor.width);
      const h = clamp(7, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      ask.resize(w, h, y, x);
    }
    {
      const w = clamp(60, 0, editor.width);
      const h = clamp(10, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      save.resize(w, h, y, x);
    }
  }

  render(): void {
    const t0 = performance.now();

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

  async run(fileName?: string): Promise<void> {
    this.children.editor.enable(true);
    this.children.editor.history.onChange = () => {
      this.#fileModified = !this.children.editor.history.isEmpty;
      this.children.header.state.fileModified = this.#fileModified;
    };

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#onSigwinch);

    if (fileName) {
      await this.#open(fileName);
    }

    this.children.editor.reset(true);

    this.#onSigwinch();

    this.#setTheme(themes.DefaultTheme);

    while (true) {
      const key = await vt.readKey();

      const cmdName = ShortcutToCommand[kitty.shortcut(key)];
      if (typeof cmdName !== "undefined") {
        const cmd = { name: cmdName } as Command;
        await this.#handleCommand(cmd);
      } else {
        this.children.editor.onKey(key);
      }

      this.render();
    }
  }

  #onZen(): void {
    this.#zen = !this.#zen;

    const { header, editor, footer } = this.children;

    header.state.disabled = this.#zen;
    footer.state.disabled = this.#zen;
    editor.state.index = !this.#zen;

    this.resizeChildren();
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
      await this.#handleCommand(cmd);
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

      this.#fileName = filePath;
      this.children.header.state.fileName = filePath;
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.children.alert.run(err);

        this.#exit();
      }
    }
  }

  async #save(): Promise<boolean> {
    if (this.#fileName) {
      return await this.#saveFile();
    } else {
      return await this.#saveFileAs();
    }
  }

  async #saveFile(): Promise<boolean> {
    try {
      await file.save(this.children.editor.textBuf, this.#fileName);

      return true;
    } catch (err) {
      await this.children.alert.run(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    while (true) {
      const filePath = await this.children.save.run(this.#fileName);
      if (!filePath) {
        return false;
      }

      try {
        await file.save(this.children.editor.textBuf, filePath);

        this.#fileName = filePath;
        this.children.header.state.fileName = filePath;

        return true;
      } catch (err) {
        await this.children.alert.run(err);
      }
    }
  }

  #onSigwinch = () => {
    const { columns, rows } = Deno.consoleSize();
    this.resize(columns, rows, 0, 0);
    this.render();
  };

  #exit = (e?: PromiseRejectionEvent) => {
    vt.restore();

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  };

  #setTheme(theme: themes.Theme): void {
    Object.values(this.children).forEach((x) => x.setTheme(theme));
  }

  async #handleCommand(cmd: Command): Promise<void> {
    switch (cmd.name) {
      case "Zen":
        this.#onZen();
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

      case "Theme":
        this.#setTheme(themes.Themes[cmd.data]);
        break;

      case "Debug":
        this.children.debug.state.disabled = !this.children.debug.state
          .disabled;
        break;

      case "Whitespace":
        if (!this.children.editor.state.disabled) {
          this.children.editor.state.whitespace = !this.children.editor.state
            .whitespace;
        }
        break;

      case "Wrap":
        if (!this.children.editor.state.disabled) {
          this.children.editor.state.wrap = !this.children.editor.state.wrap;
          this.children.editor.cursor.home(false);
        }
        break;

      case "Copy":
        if (!this.children.editor.state.disabled) {
          this.children.editor.copy();
        }
        break;

      case "Cut":
        if (!this.children.editor.state.disabled) {
          this.children.editor.cut();
        }
        break;

      case "Paste":
        if (!this.children.editor.state.disabled) {
          this.children.editor.paste();
        }
        break;

      case "Undo":
        if (!this.children.editor.state.disabled) {
          this.children.editor.undo();
        }
        break;

      case "Redo":
        if (!this.children.editor.state.disabled) {
          this.children.editor.redo();
        }
        break;

      case "SelectAll":
        if (!this.children.editor.state.disabled) {
          this.children.editor.selectAll();
        }
        break;
    }
  }
}
