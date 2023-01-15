import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

import { FileItem, FileStatus, FileTree } from "@cryo/utils";

import { workspaceRoot } from "../extension";

import { fileTreeMap } from "./state";

/** Returns a list of FileItems needed to populate a parent folder path.  */
export async function getPopulatedFileItems(parentPath: string) {
  const absoluteParentPath = path.posix.join(workspaceRoot, parentPath);
  if (!existsSync(absoluteParentPath)) {
    return [];
  }
  const dirents = await fs.readdir(absoluteParentPath, {
    withFileTypes: true,
  });
  const populatedFileItems: FileItem[] = [];
  await Promise.all(
    dirents.map(async (dirent) => {
      let isDirectory = false;
      if (dirent.isSymbolicLink()) {
        // resolve the actual path which the symbolic link points to
        // so that we can properly populate its children
        const resolvedPath = await fs.readlink(
          path.posix.join(absoluteParentPath, dirent.name)
        );
        try {
          isDirectory = (await fs.stat(resolvedPath)).isDirectory();
        } catch {
          console.error(
            `Failed to resolve symbolic link at path: ${absoluteParentPath} pointing to file ${resolvedPath}`
          );
        }
      } else {
        isDirectory = dirent.isDirectory();
      }
      if (isDirectory) {
        populatedFileItems.push({
          type: "tree",
          path: path.posix.join(parentPath, dirent.name) + "/",
          children: [],
          populated: false,
          expanded: false,
          status: FileStatus.None,
        });
      } else {
        populatedFileItems.push({
          type: "file",
          path: path.posix.join(parentPath, dirent.name),
          status: FileStatus.None,
        });
      }
    })
  );
  return [
    // also prepend a FileItem updating the parent FileItem as populated
    {
      ...(fileTreeMap[parentPath] as FileTree),
      populated: true,
    },
    ...populatedFileItems,
  ];
}
