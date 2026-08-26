"use client";

import { useEffect } from "react";
import { initMixpanel } from "@/lib/mixpanel";

export function Mixpanel() {
  useEffect(() => {
    initMixpanel();
  }, []);

  return null;
}
