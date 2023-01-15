import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";

import { FileItem, FileStatus, FileTree } from "@cryo/utils";
import { Event, subscribe } from "@parcel/watcher";

import { workspaceRoot } from "../extension";

import { gitDiff } from "./diff";
import { fileTreeMap, recipeRunning } from "./state";
import { getParentFileTree, updateFileTreeMap } from "./update";

export const pendingEvents: Event[] = [];

export async function createExplorerWatcher() {
  const subscription = await subscribe(
    workspaceRoot,
    async (error, events) => {
      // TODO: in general, most information about status changes can be determined
      // from just these file change events. Diffing should only be used for identifying
      // whether file contents have changed, etc. - shifting the other logic to use
      // these events would likely improve performance.
      if (recipeRunning) {
        pendingEvents.push(...events);
        gitDiff();
      } else {
        await processEvents(events);
      }
    },
    {
      ignore: [".cryogen"],
    }
  );
  return {
    dispose: () => subscription.unsubscribe(),
  };
}

/**
 * Processes throttled file change events, after diffing is complete.
 * In the current implementation, this is mainly used for updating created
 * and deleted directories, since Git doesn't know about them.
 */
export async function processEvents(events: Event[]) {
  const fileItems: FileItem[] = [];
  for (const event of events) {
    if (event.type === "update") continue;

    let filePath = path.posix.relative(
      workspaceRoot,
      event.path.replaceAll("\\", "/")
    );

    let isDirectory: boolean;
    if (existsSync(filePath)) {
      isDirectory = (await fs.stat(filePath)).isDirectory();
    } else {
      isDirectory = fileTreeMap[filePath]?.type !== "file";
    }

    // directories have a trailing slash so they can be differentiated from
    // files with the same name (could happen if a file is deleted but a directory
    // with the same name is created)
    // this does create some edge cases for these change events, which is why the
    // isDirectory logic above is a bit strange
    if (isDirectory) {
      filePath += "/";
    }

    const parentPopulated = getParentFileTree({
      path: filePath,
    })?.populated;

    const emptyTree: FileTree = {
      type: "tree",
      path: filePath,
      children: [],
      expanded: false,
      populated: false,
      status: FileStatus.None,
    };

    if (event.type === "delete") {
      if (recipeRunning) {
        if (isDirectory) {
          // if running a recipe, we only care about this special case of
          // marking directories as deleted since Git doesn't know about them
          fileItems.push({
            ...emptyTree, // include the empty tree in case this path didn't exist in the fileTreeMap before
            ...(fileTreeMap[filePath] && fileTreeMap[filePath]), // don't overwrite any existing properties, e.g. its children
            status:
              // edge case: only actually add a deleted folder if it has a deleted child,
              // since otherwise its entire tree (and itself) were added and deleted during
              // the recipe (so we remove it from the tree, since no changes were actually made)
              fileTreeMap[filePath]?.status === FileStatus.HasDeletedChild
                ? FileStatus.Deleted
                : FileStatus.RemovedFromTree,
          });
        }
      } else if (parentPopulated) {
        // don't update unpopulated parents for performance reasons
        fileItems.push({
          ...fileTreeMap[filePath],
          status: FileStatus.RemovedFromTree,
        });
      }
    } else if (event.type === "create") {
      if (isDirectory) {
        if (!fileTreeMap[filePath]) {
          // adds any folders created without children, since Git doesn't know about them
          fileItems.push(emptyTree);
        }
      } else if (!recipeRunning && parentPopulated) {
        // don't update unpopulated parents for performance reasons
        fileItems.push({
          type: "file",
          path: filePath,
          status: FileStatus.None,
        });
      }
    }
  }

  if (fileItems.length > 0) {
    await updateFileTreeMap(fileItems);
  }
}
