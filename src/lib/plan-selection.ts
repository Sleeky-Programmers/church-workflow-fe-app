const PLAN_SELECTION_KEY = "checkout:selected-plan";

export type SelectedPlan = {
  plan: string;
  billingCycle: "MONTHLY" | "YEARLY";
};

export function saveSelectedPlan(plan: SelectedPlan): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PLAN_SELECTION_KEY, JSON.stringify(plan));
}

export function getSelectedPlan(): SelectedPlan | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(PLAN_SELECTION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SelectedPlan;
  } catch {
    return null;
  }
}

export function clearSelectedPlan(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(PLAN_SELECTION_KEY);
}
