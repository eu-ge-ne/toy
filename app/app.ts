import { Command, ShortcutToCommand } from "@lib/commands";
import * as file from "@lib/file";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert } from "@ui/alert";
import { Ask } from "@ui/ask";
import { Debug } from "@ui/debug";
import { Editor } from "@ui/editor";
import { Footer } from "@ui/footer";
import { Header } from "@ui/header";
import { Palette } from "@ui/palette";
import { SaveAs } from "@ui/save-as";

export class App extends Control {
  header: Header;
  footer: Footer;
  editor: Editor;
  debug: Debug;
  palette: Palette;
  alert: Alert;
  ask: Ask;
  saveas: SaveAs;

  #file_path = "";

  constructor() {
    super(undefined as unknown as Control);

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
    this.editor.on_input_handled = (x) => this.debug.set_input_time(x);
    this.editor.on_render = (x) => this.debug.set_render_time(x);
    this.editor.on_cursor = (x) => this.footer.set_cursor_status(x);
    this.editor.history.on_changed = () =>
      this.header.set_unsaved_flag(!this.editor.history.is_empty);

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

  override layout({ y, x, w, h }: Area): void {
    this.area.y = y;
    this.area.x = x;
    this.area.w = w;
    this.area.h = h;

    this.header.layout(this.area);
    this.footer.layout(this.area);
    this.editor.layout(this.area);
    this.debug.layout(this.editor.area);
    this.palette.layout(this.editor.area);
    this.alert.layout(this.editor.area);
    this.ask.layout(this.editor.area);
    this.saveas.layout(this.editor.area);
  }

  render(): void {
    vt.sync.bsu();

    this.header.render();
    this.editor.render();
    this.footer.render();
    this.debug.render();
    this.saveas.render();
    this.alert.render();
    this.ask.render();
    this.palette.render();

    vt.sync.esu();
  }

  async #processInput(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.render();
          continue;
        }

        const cmdName = ShortcutToCommand[key.toString()];
        if (typeof cmdName !== "undefined") {
          await this.handleCommand({ name: cmdName } as Command);
          continue;
        }

        if (this.editor.handleKey(key)) {
          this.editor.render();
        }
      }
    }
  }

  async handleCommand(cmd: Command): Promise<boolean> {
    let layoutChanged = false;

    switch (cmd.name) {
      case "Zen":
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
            this.editor.render();
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
      if (await this.ask.open("Save changes?")) {
        await this.#save();
      }
    }

    this.#exit();
  }

  async #handlePalette(): Promise<void> {
    this.editor.enable(false);

    const command = await this.palette.open();

    this.editor.enable(true);

    this.editor.render();

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

    this.editor.render();
  }

  async #open(file_path: string): Promise<void> {
    try {
      await file.load(this.editor.buffer, file_path);

      this.#setFilePath(file_path);
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.alert.open(err);

        this.#exit();
      }
    }
  }

  async #save(): Promise<boolean> {
    if (this.#file_path) {
      return await this.#saveFile();
    } else {
      return await this.#saveFileAs();
    }
  }

  async #saveFile(): Promise<boolean> {
    try {
      await file.save(this.editor.buffer, this.#file_path);

      return true;
    } catch (err) {
      await this.alert.open(err);

      return await this.#saveFileAs();
    }
  }

  async #saveFileAs(): Promise<boolean> {
    while (true) {
      const file_path = await this.saveas.open(this.#file_path);
      if (!file_path) {
        return false;
      }

      try {
        await file.save(this.editor.buffer, file_path);

        this.#setFilePath(file_path);

        return true;
      } catch (err) {
        await this.alert.open(err);
      }
    }
  }

  #setFilePath(file_path: string): void {
    this.#file_path = file_path;

    this.header.set_file_path(file_path);
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
    this.layout({ y: 0, x: 0, w, h });
    vt.dummy_req();
  }
}
