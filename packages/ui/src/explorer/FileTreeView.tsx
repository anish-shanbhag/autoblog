import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import { FileStatus, FileTree } from "@cryo/utils";
import { useAtom } from "jotai";
import { PrimitiveAtom, SetAtom } from "jotai/core/atom";
import { useMemo } from "react";

import { FileItemView, FileItemViewProps } from "./FileItemView";
import { fileStatusColorMap, getFileItemAtom } from "./utils";

interface FileTreeViewProps extends FileItemViewProps {
  combinedParents?: number;
}

export function FileTreeView({
  filePath,
  depth = 0,
  combinedParents = 0,
  vscode,
}: FileTreeViewProps) {
  const [fileTree, setFileTree] = useAtom(
    getFileItemAtom(filePath) as PrimitiveAtom<FileTree>
  );
  const firstChildAtom = useMemo(
    () =>
      fileTree.children.length > 0
        ? getFileItemAtom(fileTree.children[0])
        : getFileItemAtom(filePath),
    [fileTree.children]
  );
  const [firstChild, setFirstChild] = useAtom(firstChildAtom);

  const label = filePath
    .split("/")
    .slice(-2 - combinedParents, -1)
    .join("/");

  function toggleExpanded(
    fileTree: FileTree,
    setFileTree: SetAtom<FileTree, void>
  ) {
    setFileTree({ ...fileTree, expanded: !fileTree.expanded });
    vscode.postMessage({
      type: "expand",
      path: fileTree.path,
      expanded: !fileTree.expanded,
    });
  }

  if (fileTree.children.length === 1 && firstChild.type === "tree") {
    if (!firstChild.populated && !firstChild.expanded) {
      toggleExpanded(firstChild, setFirstChild as SetAtom<FileTree, void>);
    }
    return (
      <FileTreeView
        filePath={firstChild.path}
        depth={depth}
        combinedParents={combinedParents + 1}
        vscode={vscode}
      />
    );
  }

  const ChevronIcon = fileTree.expanded ? ChevronDownIcon : ChevronRightIcon;

  return (
    <Box userSelect="none">
      {fileTree.path !== "" && (
        <Box
          pt="2px"
          pb="1px"
          _hover={{ bg: "rgba(200,200,200,0.1)" }}
          cursor="pointer"
          onClick={() => toggleExpanded(fileTree, setFileTree)}
        >
          <Box position="relative" left={20 * depth + "px"} pr={16}>
            <ChevronIcon boxSize="18px" mt={-0.5} />
            <Box
              as="span"
              color={
                fileStatusColorMap[
                  fileTree.status as keyof typeof fileStatusColorMap
                ]
              }
              textDecoration={
                fileTree.status === FileStatus.Deleted ? "line-through" : ""
              }
            >
              {label}
            </Box>
          </Box>
        </Box>
      )}
      {fileTree.expanded && (
        <Box
          boxShadow={fileTree.path ? "inset 0.5px 0px 0px 0px #555" : ""}
          position="relative"
          left={20 * depth + 10 + "px"}
        >
          <Box
            position="relative"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            left={-20 * depth - 10 + "px"}
          >
            {fileTree.children.map((filePath) => (
              <FileItemView
                key={filePath}
                filePath={filePath}
                depth={depth + 1}
                vscode={vscode}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
