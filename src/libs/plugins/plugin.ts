import * as api from "@libs/api";

export abstract class Plugin {
  init?(_: api.API): void;
  initRuntime?(_: api.API): api.RuntimeAPI;
  initIO?(_: api.API): api.IOAPI;
  initDebug?(_: api.API): api.DebugAPI;
  initCursor?(_: api.API): api.CursorAPI;
  initDoc?(_: api.API): api.DocAPI;
  initTheme?(_: api.API): api.ThemeAPI;
  initConfirmModal?(_: api.API): api.ConfirmModalAPI;
  initFileNameModal?(_: api.API): api.FileNameModalAPI;
  initPaletteModal?(_: api.API): api.PaletteModalAPI;

  initAbout?(_: api.API): api.AboutAPI;
  initAlertModal?(_: api.API): api.AlertModalAPI;
  initZen?(_: api.API): api.ZenAPI;
}
