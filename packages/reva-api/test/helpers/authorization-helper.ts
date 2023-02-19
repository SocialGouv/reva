type MockedAuthorizationHeader = `${KeyCloakUserRole}/${string}`;

interface AuhtorizationMockParameters {
  role: KeyCloakUserRole;
  keycloakId?: string;
}
export const authorizationHeaderForUser = ({
  role,
  keycloakId,
}: AuhtorizationMockParameters): MockedAuthorizationHeader => {
  return `${role}/${keycloakId}`;
};
