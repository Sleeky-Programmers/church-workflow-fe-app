import { useUserStore } from "@/stores/useUserStore";
import type { SectionPermission, UserChurchRole } from "@/stores/useUserStore";

const LEVEL_RANK: Record<SectionPermission["accessLevel"], number> = {
  NO_ACCESS: 0,
  VIEW: 1,
  MANAGE: 2,
  FULL_ACCESS: 3,
};

// Mirrors the backend's PermissionsGuard: Super Admin always has access
// regardless of what's actually stored on its permissions array, and every
// other role is checked by comparing its granted level against what's
// required for the given module section.
export function hasAccessLevel(
  churchRole: UserChurchRole | null | undefined,
  section: string,
  required: SectionPermission["accessLevel"],
): boolean {
  if (!churchRole) return false;
  if (churchRole.type === "SYSTEM" && churchRole.roleName === "Super Admin") {
    return true;
  }

  const permission = churchRole.permissions?.find(
    (p) => p.moduleSection === section,
  );
  const level = permission?.accessLevel || "NO_ACCESS";

  return LEVEL_RANK[level] >= LEVEL_RANK[required];
}

// Convenience hook for gating UI by the current admin's permission level -
// e.g. useHasAccess("SMALL_TEAMS", "FULL_ACCESS") to hide an action only
// full-access roles are allowed to perform.
export function useHasAccess(
  section: string,
  required: SectionPermission["accessLevel"],
): boolean {
  const churchRole = useUserStore((state) => state.user?.churchRole);
  return hasAccessLevel(churchRole, section, required);
}
