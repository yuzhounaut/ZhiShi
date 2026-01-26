import atlasDataRaw from './atlasData.json';

export interface AtlasItem {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  date: number;
  path: string[];
  displayName: string;
}

interface RawAtlasItem {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  date: number;
}

export const atlasItems: AtlasItem[] = (atlasDataRaw as RawAtlasItem[]).map(item => {
  const parts = item.name.split('-');
  // Remove file extension from the last part
  const lastPart = parts[parts.length - 1];
  const lastPartNoExt = lastPart.substring(0, lastPart.lastIndexOf('.')) || lastPart;
  parts[parts.length - 1] = lastPartNoExt;

  // Merge "果" and "种子" into "果实与种子"
  if (parts[0] === '果' || parts[0] === '种子') {
    parts[0] = '果实与种子';
  }

  return {
    ...item,
    path: parts,
    displayName: lastPartNoExt
  };
});

export interface AtlasNode {
  name: string;
  fullPath: string; // e.g. "叶-叶的组成"
  isLeaf: boolean;
  item?: AtlasItem;
  coverUrl?: string;
}

export const getNodesAtPath = (currentPath: string[]): AtlasNode[] => {
  const nodesMap = new Map<string, AtlasNode>();

  atlasItems.forEach(item => {
    // Check if item starts with currentPath
    const isAtOrUnderPath = currentPath.every((p, i) => item.path[i] === p);
    if (!isAtOrUnderPath) return;

    if (item.path.length === currentPath.length) {
      // This is the item itself (shouldn't really happen if we always drill down to folders)
      // but let's handle it
      nodesMap.set(item.displayName, {
        name: item.displayName,
        fullPath: item.path.join('-'),
        isLeaf: true,
        item: item,
        coverUrl: item.url
      });
    } else {
      const nextLevelName = item.path[currentPath.length];
      const isLastLevel = item.path.length === currentPath.length + 1;
      const fullPath = item.path.slice(0, currentPath.length + 1).join('-');

      if (!nodesMap.has(nextLevelName)) {
        nodesMap.set(nextLevelName, {
          name: nextLevelName,
          fullPath: fullPath,
          isLeaf: isLastLevel,
          item: isLastLevel ? item : undefined,
          coverUrl: item.url // Use first found image as cover
        });
      }
    }
  });

  return Array.from(nodesMap.values());
};

export const searchAtlas = (query: string): AtlasItem[] => {
  if (!query) return [];
  const lowerQuery = query.toLowerCase();
  return atlasItems.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.path.some(p => p.toLowerCase().includes(lowerQuery))
  );
};
