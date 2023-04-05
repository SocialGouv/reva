type Sort = "asc" | "desc";
interface FilteredPaginatedListArgs {
  limit?: number;
  offset?: number;
  filter?: string;
}

interface PaginationInfo {
  totalRows: number;
  currentPage: number;
  totalPages: number;
  pageLength: number;
}
interface PaginatedListResult<T> {
  rows: T[];
  info: PaginationInfo;
}

interface GraphqlContext {
  reply?: unknown;
  auth?: {
    hasRole: (role: Role) => boolean
    realm_access?: {
      roles: KeyCloakUserRole[];
    };
    sub: string;
  };
  app: {
    keycloak: Keycloak.Keycloak;
    getKeycloakAdmin: () => KeycloakAdminClient;
  };
}
