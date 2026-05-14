import * as api from "@libs/api";

export abstract class Plugin {
  init?(_: api.Host): void;
  initAbout?(_: api.Host): api.About;
  initAlertModal?(_: api.Host): api.AlertModal;
  initConfirmModal?(_: api.Host): api.ConfirmModal;

  initRuntime?(_: api.Host): api.RuntimeAPI;
  initIO?(_: api.Host): api.IOAPI;
  initDebug?(_: api.Host): api.DebugAPI;
  initCursor?(_: api.Host): api.CursorAPI;
  initDoc?(_: api.Host): api.DocAPI;
  initTheme?(_: api.Host): api.ThemeAPI;
  initFileNameModal?(_: api.Host): api.FileNameModalAPI;
  initPaletteModal?(_: api.Host): api.PaletteModalAPI;

  initZen?(_: api.Host): api.ZenAPI;
}
