export type Role = "admin" | "analyst";

export interface Permission {
  resource: string;
  action: string;
}

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    { resource: "dashboard", action: "read" },
    { resource: "threats", action: "read" },
    { resource: "threats", action: "write" },
    { resource: "threats", action: "delete" },
    { resource: "logs", action: "read" },
    { resource: "logs", action: "export" },
    { resource: "analytics", action: "read" },
    { resource: "settings", action: "read" },
    { resource: "settings", action: "write" },
    { resource: "users", action: "read" },
    { resource: "users", action: "write" },
    { resource: "users", action: "delete" },
  ],
  analyst: [
    { resource: "dashboard", action: "read" },
    { resource: "threats", action: "read" },
    { resource: "logs", action: "read" },
    { resource: "logs", action: "export" },
    { resource: "analytics", action: "read" },
  ],
};

export function hasPermission(role: Role, resource: string, action: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.some(
    (permission) => permission.resource === resource && permission.action === action
  );
}

export function canAccessRoute(role: Role, route: string): boolean {
  const routePermissions: Record<string, { resource: string; action: string }> = {
    "/dashboard": { resource: "dashboard", action: "read" },
    "/threats": { resource: "threats", action: "read" },
    "/logs": { resource: "logs", action: "read" },
    "/analytics": { resource: "analytics", action: "read" },
    "/settings": { resource: "settings", action: "read" },
  };

  const permission = routePermissions[route];
  if (!permission) return false;

  return hasPermission(role, permission.resource, permission.action);
}

export function filterMenuItems(role: Role, menuItems: any[]) {
  return menuItems.filter((item) => {
    if (item.adminOnly && role !== "admin") {
      return false;
    }
    return canAccessRoute(role, item.href);
  });
}
