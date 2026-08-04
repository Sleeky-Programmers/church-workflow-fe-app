export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Church Workflow?",
    answer:
      "Church Workflow is an all-in-one church management software designed to help churches manage members, attendance, finance, tasks, and communication from a single platform.",
  },
  {
    question: "Is Church Workflow available in Nigeria?",
    answer:
      "Yes. Church Workflow is built specifically for the Nigerian church context, with Naira pricing and local support.",
  },
  {
    question: "Does Church Workflow have a free plan?",
    answer:
      "Yes. The Starter plan is free and supports up to 3 users and 100 members with core features like member management and attendance tracking.",
  },
  {
    question: "Can Church Workflow handle multiple branches?",
    answer:
      "Yes. Church Workflow is multi-branch ready, allowing large churches to manage multiple locations under one unified system.",
  },
];
