"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  dismissSuggestion,
  fetchSuggestions,
  type Suggestion,
} from "@/services/suggestionService";

const MAX_BUBBLES = 2;

interface AnchorEntry {
  token: string;
  weight: number;
}

interface SuggestionsContextValue {
  register: (ids: string[], token: string, weight: number) => void;
  unregister: (ids: string[], token: string) => void;
  /** The suggestion this anchor should show as a bubble, if any. */
  bubbleFor: (ids: string[], token: string) => Suggestion | null;
  /** Suggestions with no matching spot on screen; shown in the top strip. */
  fallback: Suggestion[];
  dismiss: (id: string) => void;
}

const SuggestionsContext = createContext<SuggestionsContextValue | null>(null);

export function useSuggestions() {
  return useContext(SuggestionsContext);
}

export function SuggestionsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [registry, setRegistry] = useState<Map<string, AnchorEntry[]>>(
    new Map(),
  );

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(pathname);
        if (!cancelled) {
          setItems(data.suggestions ?? []);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname]);

  const register = useCallback(
    (ids: string[], token: string, weight: number) => {
      setRegistry((prev) => {
        const next = new Map(prev);
        for (const id of ids) {
          const entries = (next.get(id) ?? []).filter((e) => {
            return e.token !== token;
          });
          next.set(id, [...entries, { token, weight }]);
        }
        return next;
      });
    },
    [],
  );

  const unregister = useCallback((ids: string[], token: string) => {
    setRegistry((prev) => {
      const next = new Map(prev);
      for (const id of ids) {
        const entries = (next.get(id) ?? []).filter((e) => {
          return e.token !== token;
        });
        if (entries.length) {
          next.set(id, entries);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }, []);

  const winnerOf = useCallback(
    (anchorId: string): string | null => {
      const entries = registry.get(anchorId);
      if (!entries?.length) {
        return null;
      }
      return entries.reduce((best, e) => {
        return e.weight > best.weight ? e : best;
      }).token;
    },
    [registry],
  );

  // Items arrive sorted by priority; the first registered anchor wins.
  const resolved = useMemo(() => {
    return items.map((suggestion) => {
      return {
        suggestion,
        anchorId: (suggestion.anchors ?? []).find((a) => {
          return registry.has(a);
        }),
      };
    });
  }, [items, registry]);

  const bubbles = useMemo(() => {
    return resolved
      .filter((r) => {
        return r.anchorId;
      })
      .slice(0, MAX_BUBBLES);
  }, [resolved]);

  const fallback = useMemo(() => {
    return resolved
      .filter((r) => {
        return !r.anchorId;
      })
      .map((r) => {
        return r.suggestion;
      });
  }, [resolved]);

  const bubbleFor = useCallback(
    (ids: string[], token: string) => {
      const hit = bubbles.find((b) => {
        return (
          b.anchorId &&
          ids.includes(b.anchorId) &&
          winnerOf(b.anchorId) === token
        );
      });
      return hit?.suggestion ?? null;
    },
    [bubbles, winnerOf],
  );

  const dismiss = useCallback((id: string) => {
    setItems((prev) => {
      return prev.filter((s) => {
        return s.id !== id;
      });
    });
    dismissSuggestion(id).catch(() => {
      return undefined;
    });
  }, []);

  const value = useMemo(() => {
    return { register, unregister, bubbleFor, fallback, dismiss };
  }, [register, unregister, bubbleFor, fallback, dismiss]);

  return (
    <SuggestionsContext.Provider value={value}>
      {children}
    </SuggestionsContext.Provider>
  );
}
