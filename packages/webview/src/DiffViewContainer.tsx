import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import {
  DiffItemAtomProvider,
  DiffStatus,
  DiffTree,
  DiffTreeMap,
} from "@cryo/ui";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { WebviewApi } from "vscode-webview";

import { handleMessage } from "./handleMessage";

const diffTree: DiffTree = {
  type: "tree",
  path: "",
  children: [],
  populated: false,
  expanded: true,
  status: DiffStatus.None,
};
const diffTreeMap: DiffTreeMap = {
  "": diffTree,
};

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: "",
        bg: "",
        padding: 0,
      },
    },
  },
});

const diffTreeAtom = atom(diffTreeMap);

let messageListenerRegistered = false;

export default function DiffViewContainer({
  vscode,
}: {
  vscode: WebviewApi<unknown>;
}) {
  const [_, setDiffTreeMap] = useAtom(diffTreeAtom);

  useEffect(() => {
    if (!messageListenerRegistered) {
      messageListenerRegistered = true;
      window.addEventListener("message", (event) =>
        handleMessage({ event, setDiffTreeMap })
      );
    }
  }, []);

  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <DiffItemAtomProvider
        diffTreeAtom={diffTreeAtom}
        filePath=""
        label=""
        depth={0}
        vscode={vscode}
      />
    </ChakraProvider>
  );
}
