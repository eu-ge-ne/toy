import * as commands from "@lib/commands";
import * as file from "@lib/file";
import * as theme from "@lib/theme";
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

    this.#set_colors(vt.TRUECOLOR ? theme.NEUTRAL : theme.BASE16);
    this.#enable_zen(true);

    if (fileName) {
      await this.#open(fileName);
    }

    this.editor.reset(true);
    this.editor.render();

    await this.#process_input();
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

  async #process_input(): Promise<void> {
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.render();
          continue;
        }

        const cmd = commands.All.find((x) => x.keys.some((y) => y.equal(key)));
        if (cmd) {
          await this.#handleCommand(cmd);
          continue;
        }

        if (this.editor.enabled) {
          if (this.editor.handle_key(key)) {
            this.editor.render();
          }
        }
      }
    }
  }

  async #handleCommand(cmd: commands.Command): Promise<void> {
    switch (cmd) {
      case commands.Copy:
        this.#handleCopy();
        break;
      case commands.Cut:
        this.#handleCut();
        break;
      case commands.Debug:
        this.#handleDebug();
        break;
      case commands.Exit:
        await this.#handleExit();
        break;
      case commands.Palette:
        await this.#handlePalette();
        break;
      case commands.Paste:
        this.#handlePaste();
        break;
      case commands.Redo:
        this.#handleRedo();
        break;
      case commands.Save:
        await this.#handleSave();
        break;
      case commands.SelectAll:
        this.#handleSelectAll();
        break;
      case commands.ThemeBase16:
        this.#handleThemeBase16();
        break;
      case commands.ThemeGray:
        this.#handleThemeGray();
        break;
      case commands.ThemeNeutral:
        this.#handleThemeNeutral();
        break;
      case commands.ThemeSlate:
        this.#handleThemeSlate();
        break;
      case commands.ThemeStone:
        this.#handleThemeStone();
        break;
      case commands.ThemeZinc:
        this.#handleThemeZinc();
        break;
      case commands.Undo:
        this.#handleUndo();
        break;
      case commands.Whitespace:
        this.#handleWhitespace();
        break;
      case commands.Wrap:
        this.#handleWrap();
        break;
      case commands.Zen:
        this.#handleZen();
        break;
    }
  }

  #handleCopy(): void {
    if (this.editor.enabled) {
      if (this.editor.copy()) {
        this.editor.render();
      }
    }
  }

  #handleCut(): void {
    if (this.editor.enabled) {
      if (this.editor.cut()) {
        this.editor.render();
      }
    }
  }

  #handleDebug(): void {
    this.debug.enabled = !this.debug.enabled;

    this.editor.render();
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

    const cmd = await this.palette.open();

    this.editor.enabled = true;

    this.editor.render();

    if (cmd) {
      await this.#handleCommand(cmd);
    }
  }

  #handlePaste(): void {
    if (this.editor.enabled) {
      if (this.editor.paste()) {
        this.editor.render();
      }
    }
  }

  #handleRedo(): void {
    if (!this.editor.enabled) {
      return;
    }

    if (this.editor.history.redo()) {
      this.editor.render();
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

  #handleSelectAll(): void {
    if (this.editor.enabled) {
      this.editor.cursor.set(0, 0, false);
      this.editor.cursor.set(
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        true,
      );

      this.editor.render();
    }
  }

  #handleThemeBase16(): void {
    this.#set_colors(theme.BASE16);
    this.render();
  }

  #handleThemeGray(): void {
    this.#set_colors(theme.GRAY);
    this.render();
  }

  #handleThemeNeutral(): void {
    this.#set_colors(theme.NEUTRAL);
    this.render();
  }

  #handleThemeSlate(): void {
    this.#set_colors(theme.SLATE);
    this.render();
  }

  #handleThemeStone(): void {
    this.#set_colors(theme.STONE);
    this.render();
  }

  #handleThemeZinc(): void {
    this.#set_colors(theme.ZINC);
    this.render();
  }

  #handleUndo(): void {
    if (!this.editor.enabled) {
      return;
    }

    if (this.editor.history.undo()) {
      this.editor.render();
    }
  }

  #handleWhitespace(): void {
    this.editor.whitespace_enabled = !this.editor.whitespace_enabled;

    this.editor.render();
  }

  #handleWrap(): void {
    this.editor.wrap_enabled = !this.editor.wrap_enabled;
    this.editor.cursor.home(false);

    this.editor.render();
  }

  #handleZen(): void {
    this.#enable_zen(!this.zen_enabled);
  }

  async #open(file_path: string): Promise<void> {
    try {
      await file.load(this.editor.buffer, file_path);

      this.#set_file_path(file_path);
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
      return await this.#save_file();
    } else {
      return await this.#save_file_as();
    }
  }

  async #save_file(): Promise<boolean> {
    try {
      await file.save(this.editor.buffer, this.#file_path);

      return true;
    } catch (err) {
      await this.alert.open(err);

      return await this.#save_file_as();
    }
  }

  async #save_file_as(): Promise<boolean> {
    while (true) {
      const file_path = await this.saveas.open(this.#file_path);
      if (!file_path) {
        return false;
      }

      try {
        await file.save(this.editor.buffer, file_path);

        this.#set_file_path(file_path);

        return true;
      } catch (err) {
        await this.alert.open(err);
      }
    }
  }

  #set_file_path(file_path: string): void {
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

  #set_colors(tokens: theme.Tokens): void {
    set_alert_colors(tokens);
    set_ask_colors(tokens);
    set_editor_colors(tokens);
    set_debug_colors(tokens);
    set_footer_colors(tokens);
    set_header_colors(tokens);
    set_palette_colors(tokens);
    set_save_as_colors(tokens);
  }

  #enable_zen(enable: boolean): void {
    this.zen_enabled = enable;

    this.header.enabled = !enable;
    this.footer.enabled = !enable;
    this.editor.index_enabled = !enable;

    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    this.render();
  }
}
