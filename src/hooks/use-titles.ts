import { useEffect, useState } from "react";

import { fetchTitles, Title } from "@/services/titleService";

let cache: Title[] | null = null;
let inFlight: Promise<Title[]> | null = null;

function loadTitles(): Promise<Title[]> {
  if (cache) {
    return Promise.resolve(cache);
  }
  if (!inFlight) {
    inFlight = fetchTitles()
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

export function useTitles() {
  const [titles, setTitles] = useState<Title[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    loadTitles()
      .then((data) => {
        if (!cancelled) {
          setTitles(data);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { titles, isLoading };
}
