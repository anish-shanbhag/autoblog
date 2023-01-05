import { Box, HStack } from "@chakra-ui/layout";
import { useAtom } from "jotai";
import { themeIcons } from "seti-icons";

import { DiffTreeViewProps } from "./DiffViewUtils";

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

export function DiffFileView({
  diffItemAtom,
  label,
  depth = 0,
  vscode,
}: DiffTreeViewProps) {
  const [diffItem] = useAtom(diffItemAtom);
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
          path: diffItem.path,
        })
      }
    >
      <HStack position="relative" left={20 * depth + "px"} spacing={2}>
        <Box
          display="inline-block"
          position="absolute"
          boxSize="20px"
          fill={color === "blue" ? "#519aba" : color}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <Box position="relative" left={20}>
          {label}
        </Box>
      </HStack>
    </Box>
  );
}
