import type { FileMap, TreeNode } from "@/types/workspace";

// Convert the nested file tree into a flat FileMap keyed by relative path.
//
// The tree endpoint is allowed to return files with empty content because full
// file contents are loaded lazily when a user opens a file. This function still
// creates entries for those files so the tab bar can derive dirty state safely.
export function treeToMap(
  nodes: TreeNode[],
  parentPath = "",
  map: FileMap = {}
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
