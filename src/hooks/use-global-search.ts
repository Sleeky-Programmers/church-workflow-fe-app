"use client";

import { useEffect, useRef, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import {
  globalSearch,
  type GlobalSearchResponse,
} from "@/services/searchService";
import { useUserStore } from "@/stores/useUserStore";

export const GLOBAL_SEARCH_MIN_LENGTH = 2;
export const GLOBAL_SEARCH_MAX_LENGTH = 60;
const DEBOUNCE_MS = 250;
const CACHE_SIZE = 20;
const CACHE_TTL_MS = 60_000;

type CacheEntry = { at: number; data: GlobalSearchResponse };

// Module-level so results survive the palette closing and reopening.
// A Map keeps insertion order, which gives a cheap LRU: re-insert on read,
// Evict the first key when full.
const cache = new Map<string, CacheEntry>();
let cacheScope: string | null = null;

function readCache(key: string): GlobalSearchResponse | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

function writeCache(key: string, data: GlobalSearchResponse) {
  cache.delete(key);
  cache.set(key, { at: Date.now(), data });
  while (cache.size > CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    cache.delete(oldest);
  }
}

/** Results are branch-scoped, so anything cached for another branch (or another user) is stale. */
function ensureCacheScope(scope: string) {
  if (cacheScope !== scope) {
    cache.clear();
    cacheScope = scope;
  }
}

export function normalizeSearchQuery(raw: string) {
  return raw.trim().slice(0, GLOBAL_SEARCH_MAX_LENGTH);
}

type State = {
  data: GlobalSearchResponse | null;
  /** The query `data` belongs to. */
  settledQuery: string;
  fetching: boolean;
  error: Error | null;
};

const EMPTY: State = {
  data: null,
  settledQuery: "",
  fetching: false,
  error: null,
};

/**
 * Debounced, cancellable, cached call to `GET /search`. Nothing is requested
 * until the query has at least two characters.
 */
export function useGlobalSearch(rawQuery: string, enabled = true) {
  const query = normalizeSearchQuery(rawQuery);
  const debounced = useDebounce(query, DEBOUNCE_MS);
  const branchId = useUserStore((s) => {
    return s.activeBranchId;
  });
  const userId = useUserStore((s) => {
    return s.user?._id ?? null;
  });
  const scope = `${userId ?? "anon"}:${branchId ?? "none"}`;

  const [state, setState] = useState<State>(EMPTY);
  const controllerRef = useRef<AbortController | null>(null);
  const inflightQueryRef = useRef<string | null>(null);

  // Branch switch (or a different user) empties the cache immediately.
  useEffect(() => {
    ensureCacheScope(scope);
  }, [scope]);

  // Abort the in-flight request as soon as the input moves away from it,
  // Rather than waiting for the debounce to settle.
  useEffect(() => {
    if (
      controllerRef.current &&
      inflightQueryRef.current !== null &&
      inflightQueryRef.current.toLowerCase() !== query.toLowerCase()
    ) {
      controllerRef.current.abort();
      controllerRef.current = null;
      inflightQueryRef.current = null;
    }
  }, [query]);

  useEffect(() => {
    if (!enabled || debounced.length < GLOBAL_SEARCH_MIN_LENGTH) {
      setState(EMPTY);
      return;
    }

    ensureCacheScope(scope);
    const key = debounced.toLowerCase();
    const hit = readCache(key);
    if (hit) {
      setState({
        data: hit,
        settledQuery: debounced,
        fetching: false,
        error: null,
      });
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    inflightQueryRef.current = debounced;
    setState((prev) => {
      return { ...prev, fetching: true, error: null };
    });

    globalSearch(debounced, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) {
          return;
        }
        writeCache(key, res);
        setState({
          data: res,
          settledQuery: debounced,
          fetching: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === "AbortError")
        ) {
          return;
        }
        setState({
          data: null,
          settledQuery: debounced,
          fetching: false,
          error: err instanceof Error ? err : new Error("Search failed"),
        });
      })
      .finally(() => {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          inflightQueryRef.current = null;
        }
      });

    return () => {
      return controller.abort();
    };
  }, [debounced, enabled, scope]);

  const active = enabled && query.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const isCurrent = active && state.settledQuery === query;

  return {
    query,
    isActive: active,
    // Still typing (debounce pending) or waiting on the network.
    isLoading: active && (!isCurrent || state.fetching),
    results: isCurrent ? (state.data?.results ?? null) : null,
    partial: isCurrent ? (state.data?.partial ?? false) : false,
    error: isCurrent ? state.error : null,
  };
}
