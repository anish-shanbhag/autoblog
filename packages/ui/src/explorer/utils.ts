import {
  emptyFileTreeMap,
  FileItem,
  FileStatus,
  FileTreeMap,
} from "@cryo/utils";
import { atom, PrimitiveAtom } from "jotai";

export const fileTreeMap: FileTreeMap = emptyFileTreeMap;
export const fileTreeAtomMap: Record<string, PrimitiveAtom<FileItem>> = {};

/**
 * Returns a jotai atom containing the FileItem for a given file path.
 */
export function getFileItemAtom(filePath: string) {
  if (!fileTreeAtomMap[filePath]) {
    fileTreeAtomMap[filePath] = atom(fileTreeMap[filePath]);
  }
  return fileTreeAtomMap[filePath];
}

export const fileStatusColorMap = {
  [FileStatus.None]: "",
  [FileStatus.Added]: "rgb(110,201,145)",
  [FileStatus.Modified]: "rgb(225,191,141)",
  [FileStatus.Deleted]: "rgb(248,128,109)",
  [FileStatus.HasDeletedChild]: "rgb(248,128,109)",
};
