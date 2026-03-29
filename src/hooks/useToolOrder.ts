import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'firewood:tool-order';

export function useToolOrder(defaultIds: string[]) {
  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        // Merge: keep saved order, append any new tools not yet in the list
        const known = new Set(parsed);
        const merged = parsed.filter((id) => defaultIds.includes(id));
        for (const id of defaultIds) {
          if (!known.has(id)) merged.push(id);
        }
        return merged;
      }
    } catch {
      // fall through
    }
    return defaultIds;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderedIds));
    } catch {
      // silently fail
    }
  }, [orderedIds]);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    setOrderedIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return { orderedIds, reorder };
}
