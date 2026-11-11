import { useEffect, useState } from "react";

import { fetchLocations, Location } from "@/services/locationService";

let cache: Location[] | null = null;
let inFlight: Promise<Location[]> | null = null;

function loadLocations(): Promise<Location[]> {
  if (cache) {
    return Promise.resolve(cache);
  }
  if (!inFlight) {
    inFlight = fetchLocations()
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

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    loadLocations()
      .then((data) => {
        if (!cancelled) {
          setLocations(data);
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

  return { locations, isLoading };
}
