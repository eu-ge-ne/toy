import { DECResetMode, decrst, decset, DECSetMode } from "@eu-ge-ne/ctlseqs";

export const bsu = decset(DECSetMode.BSU);
export const esu = decrst(DECResetMode.ESU);
