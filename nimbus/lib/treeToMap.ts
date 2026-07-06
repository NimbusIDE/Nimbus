import type { FileMap, TreeNode } from "@/types/workspace";

// Flatten tree nodes into a file cache keyed by workspace-relative path.
export function treeToMap(
  nodes: TreeNode[],
  parentPath = "",
  map: FileMap = {},
): FileMap {
  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (node.type === "file") {
      map[currentPath] = {
        name: node.name,
        contents: node.content ?? "",
        isDirty: false,
        isLoaded: Boolean(node.content),
      };
    } else if (node.children) {
      treeToMap(node.children, currentPath, map);
    }
  }

  return map;
}
