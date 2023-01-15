import { fileTreeAtomMap, fileTreeMap, getFileItemAtom } from "@cryo/ui";
import { FileItem, FileStatus } from "@cryo/utils";

import { writeAtom } from "./Explorer";

// TODO: currently, messaging is coupled directly to VS Code and so the UI package is also
// indirectly dependent on VS Code as well. In the future, there should be a generic
// type-safe messaging interface which can be used in both VS Code and the browser
export function handleMessage({
  event,
}: {
  event: MessageEvent<{
    type: "diff";
    fileItems: FileItem[];
  }>;
}) {
  switch (event.data.type) {
    case "diff":
      // applies a simple replace/delete policy for updating the file tree
      // since all propagation/processing was done by the extension already
      for (const fileItem of event.data.fileItems) {
        if (fileItem.status === FileStatus.RemovedFromTree) {
          delete fileTreeMap[fileItem.path];
          delete fileTreeAtomMap[fileItem.path];
        } else {
          fileTreeMap[fileItem.path] = fileItem;
          writeAtom(getFileItemAtom(fileItem.path), fileItem);
        }
      }
      break;
  }
}
