import { Command, ShortcutToCommand } from "@lib/commands";
import * as file from "@lib/file";
import { Globals } from "@lib/globals";
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
  filePath = "";
  isDirty = false;
  zen = true;
  renderTree = this.renderComponent.bind(this);
  inputTime = 0;
  renderTime = 0;
  ln = 0;
  col = 0;
  lnCount = 0;

  header: Header;
  footer: Footer;
  editor: Editor;
  debug: Debug;
  palette: Palette;
  alert: Alert;
  ask: Ask;
  saveas: SaveAs;

  constructor() {
    super(undefined as unknown as Globals);

    this.header = new Header(this);
    this.footer = new Footer(this);
    this.editor = new Editor(this, { multi_line: true });
    this.debug = new Debug(this);
    this.palette = new Palette(this);
    this.alert = new Alert(this);
    this.ask = new Ask(this);
    this.saveas = new SaveAs(this);
  }

  async run(fileName?: string): Promise<void> {
    this.editor.enable(true);
    this.editor.history.on_changed = () =>
      this.isDirty = !this.editor.history.is_empty;

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#refresh);

    if (fileName) {
      await this.#open(fileName);
    }

    this.editor.reset(true);
    this.#refresh();

    await this.#processInput();
  }

  resize({ y, x, w, h }: Area): void {
    this.area.y = y;
    this.area.x = x;
    this.area.w = w;
    this.area.h = h;

    this.header.resize(this.area);
    this.footer.resize(this.area);
    this.editor.resize(this.area);
    this.debug.resize(this.editor.area);
    this.palette.resize(this.editor.area);
    this.alert.resize(this.editor.area);
    this.ask.resize(this.editor.area);
    this.saveas.resize(this.editor.area);
  }

  renderComponent(): void {
    const t0 = performance.now();

    vt.sync.bsu();

    this.header.renderComponent();
    this.editor.renderComponent();
    this.footer.renderComponent();
    this.debug.renderComponent();
    this.saveas.renderComponent();
    this.alert.renderComponent();
    this.ask.renderComponent();
    this.palette.renderComponent();

    vt.sync.esu();

    this.renderTime = performance.now() - t0;
  }

  async #processInput(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.renderComponent();
          continue;
        }

        const cmdName = ShortcutToCommand[key.toString()];
        if (typeof cmdName !== "undefined") {
          await this.handleCommand({ name: cmdName } as Command);
          continue;
        }

        if (this.editor.handleKey(key)) {
          this.renderComponent();
        }
      }
    }
  }

  async handleCommand(cmd: Command): Promise<boolean> {
    let layoutChanged = false;

    switch (cmd.name) {
      case "Zen":
        this.zen = !this.zen;
        layoutChanged = true;
        break;
    }

    switch (cmd.name) {
      case "Exit":
        await this.#handleExit();
        break;

      case "Palette":
        await this.#handlePalette();
        break;

      case "Save":
        await this.#handleSave();
        break;

      default: {
        const r = await Promise.all([
          this.alert.handleCommand(cmd),
          this.ask.handleCommand(cmd),
          this.editor.handleCommand(cmd),
          this.debug.handleCommand(cmd),
          this.footer.handleCommand(cmd),
          this.header.handleCommand(cmd),
          this.palette.handleCommand(cmd),
          this.saveas.handleCommand(cmd),
        ]);
        if (r.some((x) => x)) {
          if (layoutChanged) {
            this.#refresh();
          } else {
            this.renderComponent();
          }
          return true;
        }
      }
    }

    return false;
  }

  async #handleExit(): Promise<void> {
    this.editor.enable(false);

    if (!this.editor.history.is_empty) {
      if (await this.ask.run("Save changes?")) {
        await this.#save();
      }
    }

    this.#exit();
  }

  async #handlePalette(): Promise<void> {
    this.editor.enable(false);

    const command = await this.palette.run();

    this.editor.enable(true);

    this.renderComponent();

    if (command) {
      await this.handleCommand(command);
    }
  }

  async #handleSave(): Promise<void> {
    this.editor.enable(false);

    if (await this.#save()) {
      this.editor.reset(false);
    }

    this.editor.enable(true);

    this.renderComponent();
  }

  async #open(file_path: string): Promise<void> {
    try {
      await file.load(this.editor.buffer, file_path);

      this.filePath = file_path;
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.alert.run(err);

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
      await file.save(this.editor.buffer, this.filePath);

      return true;
    } catch (err) {
      await this.alert.run(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    while (true) {
      const file_path = await this.saveas.run(this.filePath);
      if (!file_path) {
        return false;
      }

      try {
        await file.save(this.editor.buffer, file_path);

        this.filePath = file_path;

        return true;
      } catch (err) {
        await this.alert.run(err);
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

  #refresh(): void {
    const { columns: w, rows: h } = Deno.consoleSize();
    this.resize({ y: 0, x: 0, w, h });

    vt.dummy_req();
  }
}
