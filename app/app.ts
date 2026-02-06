import { Command, ShortcutToCommand } from "@lib/commands";
import * as file from "@lib/file";
import { Theme, Themes } from "@lib/themes";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert, set_alert_colors } from "@ui/alert";
import { Ask, set_ask_colors } from "@ui/ask";
import { Debug, set_debug_colors } from "@ui/debug";
import { Editor, set_editor_colors } from "@ui/editor";
import { Footer, set_footer_colors } from "@ui/footer";
import { Header, set_header_colors } from "@ui/header";
import { Palette, set_palette_colors } from "@ui/palette";
import { SaveAs, set_save_as_colors } from "@ui/save-as";

export class App extends Control {
  header: Header;
  footer: Footer;
  editor: Editor;
  debug: Debug;
  palette: Palette;
  alert: Alert;
  ask: Ask;
  saveas: SaveAs;

  zen_enabled = true;
  #file_path = "";

  constructor() {
    super();

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
    this.editor.enabled = true;
    this.editor.on_input_handled = (x) => this.debug.set_input_time(x);
    this.editor.on_render = (x) => this.debug.set_render_time(x);
    this.editor.on_cursor = (x) => this.footer.set_cursor_status(x);
    this.editor.history.on_changed = () =>
      this.header.set_unsaved_flag(!this.editor.history.is_empty);

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.#exit);
    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.#setColors(vt.TRUECOLOR ? Themes.Neutral : Themes.Base16);
    this.#enableZen(true);

    if (fileName) {
      await this.#open(fileName);
    }

    this.editor.reset(true);
    this.editor.render();

    await this.#processInput();
  }

  override layout({ y, x, w, h }: Area): void {
    this.y = y;
    this.x = x;
    this.w = w;
    this.h = h;

    this.header.layout(this);
    this.footer.layout(this);
    this.editor.layout(
      this.zen_enabled ? this : {
        y: this.y + 1,
        x: this.x,
        w: this.w,
        h: this.h - 2,
      },
    );
    this.debug.layout(this.editor);
    this.palette.layout(this.editor);
    this.alert.layout(this.editor);
    this.ask.layout(this.editor);
    this.saveas.layout(this.editor);
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

  #on_sigwinch = () => {
    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    vt.dummy_req();
  };

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

  async handleCommand(command: Command): Promise<boolean> {
    if (command.name === "Theme") {
      this.#handleTheme(Themes[command.data]);
    }

    switch (command.name) {
      case "Exit":
        await this.#handleExit();
        break;
      case "Palette":
        await this.#handlePalette();
        break;
      case "Save":
        await this.#handleSave();
        break;
      case "Zen":
        this.#handleZen();
        break;
      default:
        if (
          await this.debug.handleCommand(command) ||
          await this.editor.handleCommand(command)
        ) {
          this.editor.render();
          return true;
        }
    }

    return false;
  }

  async #handleExit(): Promise<void> {
    this.editor.enabled = false;

    if (!this.editor.history.is_empty) {
      if (await this.ask.open("Save changes?")) {
        await this.#save();
      }
    }

    this.#exit();
  }

  async #handlePalette(): Promise<void> {
    this.editor.enabled = false;

    const command = await this.palette.open();

    this.editor.enabled = true;

    this.editor.render();

    if (command) {
      await this.handleCommand(command);
    }
  }

  async #handleSave(): Promise<void> {
    this.editor.enabled = false;

    if (await this.#save()) {
      this.editor.reset(false);
    }

    this.editor.enabled = true;

    this.editor.render();
  }

  #handleTheme(t: Theme): void {
    this.#setColors(t);
    this.render();
  }

  #handleZen(): void {
    this.#enableZen(!this.zen_enabled);
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

  #setColors(tokens: Theme): void {
    set_alert_colors(tokens);
    set_ask_colors(tokens);
    set_editor_colors(tokens);
    set_debug_colors(tokens);
    set_footer_colors(tokens);
    set_header_colors(tokens);
    set_palette_colors(tokens);
    set_save_as_colors(tokens);
  }

  #enableZen(enable: boolean): void {
    this.zen_enabled = enable;

    this.header.enabled = !enable;
    this.footer.enabled = !enable;
    this.editor.index_enabled = !enable;

    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    this.render();
  }
}
