import { faker } from "@faker-js/faker";

export type FranceConnectClaimsFixture = {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  birthdate: string;
  birthcountry?: string;
  birthplace?: string;
};

export const buildFranceConnectClaims = (
  overrides?: Partial<FranceConnectClaimsFixture>,
): FranceConnectClaimsFixture => ({
  sub: faker.string.uuid(),
  email: faker.internet.email().toLowerCase(),
  given_name: "Jean",
  family_name: "Dupont",
  birthdate: "1990-05-15",
  birthcountry: "99100",
  birthplace: "75056",
  ...overrides,
});
