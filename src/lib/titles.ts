// Canonical title catalog, used everywhere a title is picked or displayed:
// invite-user form, invite-leader form (via InviteUserDialog), add/edit
// member, member CSV import, and profile/account settings.
//
// Kept in sync by hand with the backend's equivalent list
// (church-workflow-backend/src/common/utils/titles.constant.ts) - the two
// apps are separate repos with no shared-package infrastructure today, so
// true single-file sharing isn't available. The backend accepts free text
// regardless (see CreateMemberDto), so this list only drives suggestions.
export const TITLE_CATEGORIES: Record<string, string[]> = {
  General: [
    "Mr",
    "Mrs",
    "Miss",
    "Ms",
    "Dr",
    "Prof",
    "Engr",
    "Barr",
    "Arc",
    "Chief",
    "Hon",
    "Sir",
    "Lady",
  ],
  Pastoral: [
    "Pastor",
    "Senior Pastor",
    "Assistant Pastor",
    "Associate Pastor",
    "Youth Pastor",
    "Resident Pastor",
    "Pastor (Mrs)",
    "Minister",
    "Evangelist",
    "Missionary",
    "Overseer",
    "General Overseer",
  ],
  "Five-fold": ["Apostle", "Prophet", "Prophetess", "Teacher"],
  Clergy: [
    "Rev",
    "Rev. Dr",
    "Very Rev",
    "Rt. Rev",
    "Most Rev",
    "Rev. Fr",
    "Fr",
    "Sr (Rev. Sister)",
    "Bishop",
    "Archbishop",
    "Canon",
    "Venerable (Ven.)",
  ],
  "Church Offices": [
    "Elder",
    "Deacon",
    "Deaconess",
    "Brother",
    "Sister",
    "Mother in Israel",
  ],
};

export const TITLE_MAX_LENGTH = 50;

// Case- and punctuation-insensitive, so "rev" matches "Rev. Dr" and "Very Rev".
export function normalizeTitleQuery(value: string): string {
  return value.toLowerCase().replace(/[.\s]/g, "");
}

export function findExactTitleMatch(query: string): string | undefined {
  const normalized = normalizeTitleQuery(query);
  if (!normalized) return undefined;

  for (const labels of Object.values(TITLE_CATEGORIES)) {
    const match = labels.find(
      (label) => normalizeTitleQuery(label) === normalized,
    );
    if (match) return match;
  }
  return undefined;
}
