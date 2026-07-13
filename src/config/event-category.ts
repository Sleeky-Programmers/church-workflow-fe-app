import { EventCategory } from "@/lib/enums";

export const EVENT_CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; dotClass: string }
> = {
  [EventCategory.GENERAL]: {
    label: "Service",
    dotClass: "bg-primary",
  },
  [EventCategory.LEADERSHIP]: {
    label: "Leadership",
    dotClass: "bg-secondary",
  },
  [EventCategory.SPECIAL]: {
    label: "Special",
    dotClass: "bg-destructive",
  },
};
