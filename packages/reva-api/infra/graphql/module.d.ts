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

interface ContextAuth {
  hasRole: (role: Role) => boolean
  token?: string;
  userInfo?: {
    email: string;
    email_verified: boolean;
    preferred_username: string;
    realm_access?: {
      roles: KeyCloakUserRole[];
    };
    sub: string;
  }
}

interface ContextApp {
  keycloak: Keycloak.Keycloak;
  getKeycloakAdmin: () => KeycloakAdminClient;
}

interface GraphqlContext {
  reply?: unknown;
  auth: ContextAuth;
  app: ContextApp;
}
