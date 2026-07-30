import { RoleVaeCollective } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export const getPermissionsForRoles = async ({
  roles,
}: {
  roles: RoleVaeCollective[];
}) => {
  const rolePermissions =
    await prismaClient.rolePermissionVaeCollective.findMany({
      where: {
        role: {
          in: roles,
        },
      },
      distinct: ["permission"],
    });

  return rolePermissions.map(({ permission }) => permission);
};
