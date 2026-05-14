import * as api from "@libs/api";

export type Plugin = {
  init?(_: api.Host): void;
  initAbout?(_: api.Host): api.About;
  initAlertModal?(_: api.Host): api.AlertModal;
  initConfirmModal?(_: api.Host): api.ConfirmModal;
  initCursor?(_: api.Host): api.Cursor;
  initDebug?(_: api.Host): api.Debug;
  initDoc?(_: api.Host): api.Doc;
  initFileNameModal?(_: api.Host): api.FileNameModal;
  initIO?(_: api.Host): api.IO;
  initPaletteModal?(_: api.Host): api.PaletteModal;
  initRuntime?(_: api.Host): api.Runtime;
  initTheme?(_: api.Host): api.Theme;
  initZen?(_: api.Host): api.Zen;
};
