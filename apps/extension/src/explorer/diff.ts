import { existsSync } from "fs";
import path from "path";

import { git } from "@cryo/node-utils";
import { FileItem, FileStatus } from "@cryo/utils";

import { workspaceRoot } from "../extension";

import { fileTreeMap } from "./state";
import { updateFileTreeMap } from "./update";
import { pendingEvents, processEvents } from "./watch";

let gitDiffTimeout: NodeJS.Timeout;

// debounce diffing to improve performance when there's lots of changes at once
export function gitDiff() {
  if (gitDiffTimeout) {
    clearTimeout(gitDiffTimeout);
  }
  gitDiffTimeout = setTimeout(debouncedGitDiff, 400);
}

// used for efficient access to the paths of files that have been updated
const diffPaths: Set<string> = new Set();
let diffRunning = false;

export async function debouncedGitDiff() {
  // prevent multiple diffs from running at the same time
  if (diffRunning) {
    gitDiff();
    return;
  }
  diffRunning = true;

  // capture the list of currently pending events so we can process them later
  // avoids the case of new events being added while diffing, which shouldn't
  // be processed until the next diff
  const currentPendingEvents = [...pendingEvents];
  pendingEvents.length = 0;

  // parse Git status output into the corresponding paths and types of updates
  const output = await git("status", "-z", "-u", "--", ":!.cryogen");
  const gitDiffs = output
    .replace(/\0$/, "")
    .split("\0")
    .map((part) => ({
      status: part.slice(1, 2).replace("?", FileStatus.Added) as FileStatus,
      path: part.slice(3),
    }));

  // keeps track of the updated FileItems to be passed to updateFileTreeMap
  const fileItems: FileItem[] = [];

  // if a file was un-created, re-deleted, modified back to its original state, etc.
  // then we need to revert its status
  for (const diffPath of diffPaths) {
    if (!gitDiffs.find((gitDiff) => gitDiff.path === diffPath)) {
      fileItems.push({
        type: "file",
        path: diffPath,
        // if the file was added but is now deleted, then it should be removed from the tree
        status: existsSync(path.relative(workspaceRoot, diffPath))
          ? FileStatus.None
          : FileStatus.RemovedFromTree,
      });
      diffPaths.delete(diffPath);
    }
  }

  for (const gitDiff of gitDiffs) {
    const oldFileItem = fileTreeMap[gitDiff.path];
    // only update the status of files with a new status
    if (oldFileItem?.status !== gitDiff.status) {
      fileItems.push({
        type: "file",
        path: gitDiff.path,
        status: gitDiff.status,
      });
      if (!(gitDiff.path in diffPaths)) {
        diffPaths.add(gitDiff.path);
      }
    }
  }

  await updateFileTreeMap(fileItems);

  await processEvents(currentPendingEvents);

  diffRunning = false;
}
