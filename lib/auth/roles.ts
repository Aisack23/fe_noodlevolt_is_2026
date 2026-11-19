export function isClientRole(role: string | undefined): boolean {
  return role === 'CLIENT';
}
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


const HOME_BY_ROLE = {
  CLIENT: "/menu",
  WAITER: "/mesero/listos",
  COOK: "/cocina/tablero",
  BRANCH_ADMIN: "/gerente/inventario",
  GENERAL_MANAGER: "/gerente/reportes",
  CASHIER: "/menu",
  INVENTORY_MANAGER: "/menu",
} as const;

export function homeForRole(role: string | null): string | null {
  return role && Object.hasOwn(HOME_BY_ROLE, role)
    ? HOME_BY_ROLE[role as keyof typeof HOME_BY_ROLE]
    : null;
}
