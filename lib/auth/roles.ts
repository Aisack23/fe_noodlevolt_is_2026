export const BRANCH_ADMINISTRATION_ROLES = ["GENERAL_MANAGER", "BRANCH_ADMIN"] as const;

export type BranchAdministrationRole = (typeof BRANCH_ADMINISTRATION_ROLES)[number];

export function canAccessBranchAdministration(role: string | undefined): boolean {
  return BRANCH_ADMINISTRATION_ROLES.some((allowedRole) => allowedRole === role);
}

export function isBranchAdministrationRole(
  role: string | undefined,
): role is BranchAdministrationRole {
  return canAccessBranchAdministration(role);
}
