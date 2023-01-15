import { Box } from "@chakra-ui/layout";
import { FileStatus } from "@cryo/utils";
import { useAtomValue } from "jotai";
import { themeIcons } from "seti-icons";

import { FileItemViewProps } from "./FileItemView";
import { fileStatusColorMap, getFileItemAtom } from "./utils";

const getIcon = themeIcons({
  blue: "#519aba",
  grey: "#4d5a5e",
  "grey-light": "#6d8086",
  green: "#8dc149",
  orange: "#e37933",
  pink: "#f55385",
  purple: "#a074c4",
  red: "#cc3e44",
  white: "#d4d7d6",
  yellow: "#cbcb41",
  ignore: "#41535b",
});

export function FileView({ filePath, depth = 0, vscode }: FileItemViewProps) {
  const fileItem = useAtomValue(getFileItemAtom(filePath));

  const label = fileItem.path.split("/").pop()!;
  const { svg, color } = getIcon(label);

  return (
    <Box
      _hover={{ bg: "rgba(200,200,200,0.1)" }}
      cursor="pointer"
      pt="2px"
      pb="1px"
      onClick={() =>
        vscode.postMessage({
          type: "open",
          path: fileItem.path,
        })
      }
    >
      <Box position="relative" left={20 * depth + "px"} pr={32}>
        <Box
          display="inline-block"
          position="absolute"
          minW="20px"
          w="20px"
          minH="20px"
          h="20px"
          fill={color}
          // TODO: use a different method to display the SVGs
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <Box
          as="span"
          ml={20}
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          color={
            fileStatusColorMap[
              fileItem.status as keyof typeof fileStatusColorMap
            ]
          }
          textDecoration={
            fileItem.status === FileStatus.Deleted ? "line-through" : ""
          }
        >
          {label}
        </Box>
      </Box>
    </Box>
  );
}
