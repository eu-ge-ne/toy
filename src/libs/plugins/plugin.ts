import * as api from "@libs/api";

export abstract class Plugin {
  init?(_: api.Host): void;
  about?: new (_: api.Host) => api.About;

  initRuntime?(_: api.Host): api.RuntimeAPI;
  initIO?(_: api.Host): api.IOAPI;
  initDebug?(_: api.Host): api.DebugAPI;
  initCursor?(_: api.Host): api.CursorAPI;
  initDoc?(_: api.Host): api.DocAPI;
  initTheme?(_: api.Host): api.ThemeAPI;
  initConfirmModal?(_: api.Host): api.ConfirmModalAPI;
  initFileNameModal?(_: api.Host): api.FileNameModalAPI;
  initPaletteModal?(_: api.Host): api.PaletteModalAPI;

  initAlertModal?(_: api.Host): api.AlertModalAPI;
  initZen?(_: api.Host): api.ZenAPI;
}
