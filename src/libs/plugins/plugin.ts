import * as api from "@libs/api";

export type Plugin = {
  init?(_: api.Toy): void;
  initAbout?(_: api.Toy): api.About;
  initAlertModal?(_: api.Toy): api.AlertModal;
  initConfirmModal?(_: api.Toy): api.ConfirmModal;
  initCursor?(_: api.Toy): api.Cursor;
  initDebug?(_: api.Toy): api.Debug;
  initDoc?(_: api.Toy): api.Doc;
  initFileNameModal?(_: api.Toy): api.FileNameModal;
  initIO?(_: api.Toy): api.IO;
  initPaletteModal?(_: api.Toy): api.PaletteModal;
  initRuntime?(_: api.Toy): api.Runtime;
  initTheme?(_: api.Toy): api.Theme;
  initZen?(_: api.Toy): api.Zen;
};
