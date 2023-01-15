import { useAtomValue } from "jotai";
import { memo } from "react";
import { WebviewApi } from "vscode-webview";

import { FileTreeView } from "./FileTreeView";
import { FileView } from "./FileView";
import { getFileItemAtom } from "./utils";

export interface FileItemViewProps {
  filePath: string;
  depth?: number;
  vscode: WebviewApi<unknown>;
}

export const FileItemView = memo(
  // eslint-disable-next-line prefer-arrow-callback
  function FileItemView(props: FileItemViewProps) {
    const fileItem = useAtomValue(getFileItemAtom(props.filePath));
    if (!fileItem) {
      return null;
    }
    if (fileItem.type === "file") {
      return <FileView {...props} />;
    }
    return <FileTreeView {...props} />;
  }
);
