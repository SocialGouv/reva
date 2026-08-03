"use server";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";
import { PermissionVaeCollective } from "@/graphql/generated/graphql";

const getUserPermissionsQuery = graphql(`
  query vaeCollective_getUserPermissions {
    vaeCollective_getUserPermissions
  }
`);

const getUserPermissions = async () => {
  const accessToken = await getAccessTokenFromCookie();

  if (!accessToken) {
    return [];
  }

  const result = throwUrqlErrors(
    await client.query(
      getUserPermissionsQuery,
      {},
      {
        fetchOptions: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      },
    ),
  );

  return result.data?.vaeCollective_getUserPermissions ?? [];
};

export const hasPermission = async (permission: PermissionVaeCollective) => {
  const permissions = await getUserPermissions();
  return permissions.includes(permission);
};
