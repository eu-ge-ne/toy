import { Command, ShortcutToCommand } from "@lib/commands";
import * as file from "@lib/file";
import { Globals } from "@lib/globals";
import { Key } from "@lib/kitty";
import { Area, Component } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert } from "@ui/alert";
import { Ask } from "@ui/ask";
import { Debug } from "@ui/debug";
import { Editor } from "@ui/editor";
import { Footer } from "@ui/footer";
import { Header } from "@ui/header";
import { Palette } from "@ui/palette";
import { SaveAs } from "@ui/save-as";

export class App extends Component<Globals, [string], void> implements Globals {
  renderTree = this.render.bind(this);
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
    saveAs: SaveAs;
  };

  constructor() {
    super(undefined as unknown as Globals);

    this.#children = {
      header: new Header(this),
      editor: new Editor(this, { multiLine: true }),
      footer: new Footer(this),
      debug: new Debug(this),
      palette: new Palette(this),
      alert: new Alert(this),
      ask: new Ask(this),
      saveAs: new SaveAs(this),
    };
  }

  async run(fileName?: string): Promise<void> {
    this.#children.editor.enable(true);
    this.#children.editor.history.on_changed = () =>
      this.isDirty = !this.#children.editor.history.is_empty;

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#refresh);

    if (fileName) {
      await this.#open(fileName);
    }

    this.#children.editor.reset(true);
    this.#refresh();

    await this.#processInput();
  }

  resize({ y, x, w, h }: Area): void {
    this.area.y = y;
    this.area.x = x;
    this.area.w = w;
    this.area.h = h;

    this.#children.header.resize(this.area);
    this.#children.footer.resize(this.area);
    this.#children.editor.resize(this.area);
    this.#children.debug.resize(this.#children.editor.area);
    this.#children.palette.resize(this.#children.editor.area);
    this.#children.alert.resize(this.#children.editor.area);
    this.#children.ask.resize(this.#children.editor.area);
    this.#children.saveAs.resize(this.#children.editor.area);
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
    this.#children.saveAs.render();

    vt.sync.esu();

    this.renderTime = performance.now() - t0;
  }

  async #processInput(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        this.isLayoutDirty = false;

        await this.#iterInput(key);

        if (this.isLayoutDirty) {
          this.#refresh();
        } else {
          this.renderTree();
        }
      }
    }
  }

  async #iterInput(key: Uint8Array | Key): Promise<void> {
    if (key instanceof Uint8Array) {
      return;
    }

    const cmdName = ShortcutToCommand[key.toString()];
    if (typeof cmdName !== "undefined") {
      const cmd = { name: cmdName } as Command;
      await this.handleTree(cmd);
      return;
    }

    this.#children.editor.handleKey(key);
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
    await this.#children.saveAs.handle(cmd);
  }

  async #handleExit(): Promise<void> {
    this.#children.editor.enable(false);

    if (!this.#children.editor.history.is_empty) {
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

    this.renderTree();

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

    this.renderTree();
  }

  async #open(filePath: string): Promise<void> {
    try {
      await file.load(this.#children.editor.buffer, filePath);

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
      await file.save(this.#children.editor.buffer, this.filePath);

      return true;
    } catch (err) {
      await this.#children.alert.run(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    while (true) {
      const filePath = await this.#children.saveAs.run(this.filePath);
      if (!filePath) {
        return false;
      }

      try {
        await file.save(this.#children.editor.buffer, filePath);

        this.filePath = filePath;

        return true;
      } catch (err) {
        await this.#children.alert.run(err);
      }
    }
  }

  #exit = (e?: PromiseRejectionEvent) => {
    vt.restore();

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  };

  #refresh = () => {
    const { columns: w, rows: h } = Deno.consoleSize();
    this.resize({ y: 0, x: 0, w, h });

    vt.dummy_req();
  };
}
