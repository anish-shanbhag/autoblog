import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { PrimitiveAtom } from "jotai/core/atom";
import { memo } from "react";
import { WebviewApi } from "vscode-webview";

import { DiffFileView } from "./DiffFileView";
import { DiffTreeView } from "./DiffTreeView";
import { DiffItem, DiffTreeMap } from "./types";

export type DiffTreeAtom = PrimitiveAtom<DiffTreeMap>;

export interface DiffTreeViewProps {
  diffTreeAtom: DiffTreeAtom;
  diffItemAtom: PrimitiveAtom<DiffItem>;
  filePath: string;
  label: string;
  depth?: number;
  vscode: WebviewApi<unknown>;
}

export const DiffItemAtomProvider = memo(
  // eslint-disable-next-line prefer-arrow-callback
  function DiffItemAtomProvider(
    props: Omit<DiffTreeViewProps, "diffItemAtom">
  ) {
    const diffItemAtom = focusAtom(props.diffTreeAtom, (optic) =>
      optic.prop(props.filePath)
    );
    return (
      <DiffItemView
        {...props}
        diffItemAtom={diffItemAtom as PrimitiveAtom<DiffItem>}
      />
    );
  },
  (prevProps, nextProps) => prevProps.filePath === nextProps.filePath
);

export function DiffItemView(props: DiffTreeViewProps) {
  const [diffItem] = useAtom(props.diffItemAtom);
  if (diffItem.type === "file") {
    return <DiffFileView {...props} />;
  }
  return <DiffTreeView {...props} />;
}
