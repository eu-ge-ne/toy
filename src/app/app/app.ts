import { Alert } from "@app/alert";
import { Ask } from "@app/ask";
import { Debug } from "@app/debug";
import { Editor } from "@app/editor";
import { Footer } from "@app/footer";
import { Header } from "@app/header";
import { Palette } from "@app/palette";
import { Save } from "@app/save";
import { Command, ShortcutToCommand } from "@lib/commands";
import * as files from "@lib/files";
import * as kitty from "@lib/kitty";
import * as std from "@lib/std";
import * as themes from "@lib/themes";
import * as ui from "@lib/ui";
import * as vt from "@lib/vt";

export class App extends ui.Modal {
  #zen = true;
  #fileName = "";
  #fileModified = false;

  protected override children: {
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
        multiLine: true,
        onTextChange: () => {
          this.#fileModified = this.children.editor.textChanged;
          this.children.header.props.fileModified = this.#fileModified;
        },
        onCursorChange: (x) => {
          this.children.footer.props.ln = x.ln;
          this.children.footer.props.col = x.col;
          this.children.footer.props.lnCount = x.lnCount;
        },
        onKeyHandle: (x) => this.children.debug.props.inputTime = x,
      }),
      debug: new Debug({
        disabled: true,
        renderTime: 0,
        inputTime: 0,
      }),
      palette: new Palette({
        onInvalidate: () => {
          this.resizeChildren();
          this.#render();
        },
      }),
      alert: new Alert(),
      ask: new Ask(),
      save: new Save(),
    };
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
      const w = std.clamp(30, 0, editor.width);
      const h = std.clamp(7, 0, editor.height);
      const y = editor.y + editor.height - h;
      const x = editor.x + editor.width - w;
      debug.resize(w, h, y, x);
    }
    palette.resize(editor.width, editor.height, editor.y, editor.x);
    {
      const w = std.clamp(60, 0, editor.width);
      const h = std.clamp(10, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      alert.resize(w, h, y, x);
    }
    {
      const w = std.clamp(60, 0, editor.width);
      const h = std.clamp(7, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      ask.resize(w, h, y, x);
    }
    {
      const w = std.clamp(60, 0, editor.width);
      const h = std.clamp(10, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      save.resize(w, h, y, x);
    }
  }

  async open(fileName?: string): Promise<void> {
    const { editor } = this.children;

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#onSigwinch);

    if (fileName) {
      await this.#open(fileName);
    }

    editor.setFocused(true);
    editor.resetChanges();
    editor.resetCursor();

    this.#onSigwinch();

    this.#setTheme(themes.DefaultTheme);

    await this.#loop();
  }

  async #loop(): Promise<void> {
    while (true) {
      this.#render();

      const key = await vt.readKey();

      const cmdName = ShortcutToCommand[kitty.shortcut(key)];
      if (typeof cmdName !== "undefined") {
        const cmd = { name: cmdName } as Command;
        await this.#handleCommand(cmd);
      } else {
        this.children.editor.onKey(key);
      }
    }
  }

  #onZen(): void {
    const { header, editor, footer } = this.children;

    this.#zen = !this.#zen;

    header.props.disabled = this.#zen;
    footer.props.disabled = this.#zen;
    editor.toggleIndex();

    this.resizeChildren();
  }

  async #handleExit(): Promise<void> {
    const { editor, ask } = this.children;

    editor.setFocused(false);

    if (editor.textChanged) {
      if (await ask.open("Save changes?")) {
        await this.#save();
      }
    }

    this.#exit();
  }

  async #handlePalette(): Promise<void> {
    const { editor, palette } = this.children;

    editor.setFocused(false);

    const cmd = await palette.open();

    editor.setFocused(true);

    this.#render();

    if (cmd) {
      await this.#handleCommand(cmd);
    }
  }

  async #handleSave(): Promise<void> {
    const { editor } = this.children;

    editor.setFocused(false);

    if (await this.#save()) {
      editor.resetChanges();
    }

    editor.setFocused(true);

    this.#render();
  }

  async #open(fileName: string): Promise<void> {
    const { editor, header, alert } = this.children;

    try {
      for await (const text of files.load(fileName)) {
        editor.append(text);
      }

      this.#fileName = fileName;
      header.props.fileName = fileName;
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        await alert.open(err);

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
      await files.save(this.#fileName, this.children.editor.read());

      return true;
    } catch (err) {
      await this.children.alert.open(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    const { save, editor, header, alert } = this.children;

    while (true) {
      const fileName = await save.open(this.#fileName);
      if (!fileName) {
        return false;
      }

      try {
        await files.save(fileName, editor.read());

        this.#fileName = fileName;
        header.props.fileName = fileName;

        return true;
      } catch (err) {
        await alert.open(err);
      }
    }
  }

  #onSigwinch = () => {
    const { columns, rows } = Deno.consoleSize();
    this.resize(columns, rows, 0, 0);
    this.#render();
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
    const { editor, debug } = this.children;

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
        debug.props.disabled = !debug.props.disabled;
        break;

      case "Whitespace":
        editor.toggleWhitespace();
        break;

      case "Wrap":
        editor.toggleWrapped();
        break;

      case "Copy":
        editor.copy();
        break;

      case "Cut":
        editor.cut();
        break;

      case "Paste":
        editor.paste();
        break;

      case "Undo":
        editor.undo();
        break;

      case "Redo":
        editor.redo();
        break;

      case "SelectAll":
        editor.selectAll();
        break;
    }
  }

  #render(): void {
    const t0 = performance.now();
    this.render();
    this.children.debug.props.renderTime = performance.now() - t0;
  }
}
