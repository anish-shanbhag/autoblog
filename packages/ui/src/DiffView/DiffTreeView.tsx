import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { WritableAtom } from "jotai/core/atom";
import { useEffect, useMemo } from "react";

import { DiffItemAtomProvider, DiffTreeViewProps } from "./DiffViewUtils";
import { DiffTree } from "./types";

export function DiffTreeView({
  diffTreeAtom,
  diffItemAtom,
  label,
  depth = 0,
  vscode,
}: DiffTreeViewProps) {
  const [tree, setTree] = useAtom(
    diffItemAtom as WritableAtom<DiffTree, DiffTree>
  );
  const firstChildAtom = useMemo(
    () =>
      tree.children.length > 0
        ? focusAtom(diffTreeAtom, (optic) => optic.prop(tree.children[0]))
        : diffItemAtom,
    [diffTreeAtom, diffItemAtom, tree.children]
  );
  const [firstChild] = useAtom(firstChildAtom);
  const ChevronIcon = tree.expanded ? ChevronDownIcon : ChevronRightIcon;
  useEffect(() => {
    if (!tree.populated && tree.expanded) {
      vscode.postMessage({
        type: "populate",
        path: tree.path,
      });
    }
  }, [tree.expanded]);

  if (tree.children.length === 1 && firstChild.type === "tree") {
    return (
      <DiffTreeView
        diffTreeAtom={diffTreeAtom}
        diffItemAtom={firstChildAtom}
        filePath={firstChild.path}
        label={label + "\\" + firstChild.path.split("\\").pop()}
        depth={depth}
        vscode={vscode}
      />
    );
  }

  return (
    <Box userSelect="none">
      {tree.path && (
        <Box
          pt="2px"
          pb="1px"
          _hover={{ bg: "rgba(200,200,200,0.1)" }}
          cursor="pointer"
          onClick={() => setTree({ ...tree, expanded: !tree.expanded })}
        >
          <Box position="relative" left={20 * depth + "px"}>
            <ChevronIcon boxSize="18px" mt={-0.5} />
            {label}
          </Box>
        </Box>
      )}
      <Box
        display={tree.expanded ? "block" : "none"}
        borderLeft={tree.path ? "1px solid #555" : ""}
        position="relative"
        left={20 * depth + 10 + "px"}
      >
        <Box position="relative" left={-20 * depth - 10 + "px"}>
          {tree.children.map((filePath) => (
            <DiffItemAtomProvider
              key={filePath}
              diffTreeAtom={diffTreeAtom}
              filePath={filePath}
              label={filePath.split("\\").pop()!}
              depth={depth + 1}
              vscode={vscode}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
