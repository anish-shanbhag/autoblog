import { DiffItem, DiffTree, DiffTreeMap } from "@cryo/ui";
import { SetStateAction } from "jotai";

export function handleMessage({
  event,
  setDiffTreeMap,
}: {
  event: MessageEvent<any>;
  setDiffTreeMap: (update: SetStateAction<DiffTreeMap>) => void;
}) {
  console.log(event.data);
  const data = event.data as {
    type: "populate";
    path: string;
    files: DiffItem[];
  };
  const diffItems = data.files;
  setDiffTreeMap((diffTreeMap) => {
    let newDiffTreeMap: DiffTreeMap = {
      ...diffTreeMap,
      [data.path]: {
        ...diffTreeMap[data.path],
        children: diffItems.map((file) => file.path),
        populated: true,
      } as DiffTree,
    };
    for (const diffItem of diffItems) {
      newDiffTreeMap = {
        ...newDiffTreeMap,
        [diffItem.path]: diffItem,
      };
    }
    (newDiffTreeMap[data.path] as DiffTree).children.sort((a, b) => {
      return (
        newDiffTreeMap[b].type.localeCompare(newDiffTreeMap[a].type) ||
        a.localeCompare(b)
      );
    });
    return newDiffTreeMap;
  });
}
