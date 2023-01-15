import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { FileItemView, getFileItemAtom } from "@cryo/ui";
import { FileTree } from "@cryo/utils";
import { Setter, useAtomValue } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useEffect } from "react";

import { vscode } from "./main";
import { handleMessage } from "./message";

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

let initialized = false;

// once set by the initialization callback, this allows FileItem atoms to be
// declaratively updated by the webview in response to messages from the
// extension, which usually isn't possible since useAtom is not allowed outside
// of a component
export let writeAtom: Setter;

export default function Explorer() {
  const initWriteAtom = useAtomCallback(
    useCallback((get, set) => {
      writeAtom = set;
    }, [])
  );

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      window.addEventListener("message", (event) => handleMessage({ event }));
      vscode.postMessage({
        type: "init",
      });
      initWriteAtom();
    }
  }, []);

  const rootFileItem = useAtomValue(getFileItemAtom("")) as FileTree;

  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      {rootFileItem.populated && (
        <FileItemView filePath="" depth={0} vscode={vscode} />
      )}
    </ChakraProvider>
  );
}
