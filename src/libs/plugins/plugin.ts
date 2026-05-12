import {
  AboutAPI,
  AlertModalAPI,
  API,
  ConfirmModalAPI,
  CursorAPI,
  DebugAPI,
  DocAPI,
  FileNameModalAPI,
  IOAPI,
  PaletteModalAPI,
  RuntimeAPI,
  ThemeAPI,
  ZenAPI,
} from "@libs/api";

export type Plugin = {
  init?(_: API): void;
  initRuntime?(_: API): RuntimeAPI;
  initIO?(_: API): IOAPI;
  initDebug?(_: API): DebugAPI;
  initCursor?(_: API): CursorAPI;
  initDoc?(_: API): DocAPI;
  initTheme?(_: API): ThemeAPI;
  initZen?(_: API): ZenAPI;
  initAbout?(_: API): AboutAPI;
  initAlertModal?(_: API): AlertModalAPI;
  initConfirmModal?(_: API): ConfirmModalAPI;
  initFileNameModal?(_: API): FileNameModalAPI;
  initPaletteModal?(_: API): PaletteModalAPI;
};
