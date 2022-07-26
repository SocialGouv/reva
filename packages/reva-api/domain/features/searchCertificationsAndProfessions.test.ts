import { searchCertificationsAndProfessions } from "./searchCertificationsAndProfessions";

describe("domain search", () => {
  test("", async () => {
    const searchWithDeps = searchCertificationsAndProfessions({
      searchCertificationsByQuery: () => Promise.resolve([]),
      searchProfessionsByQuery: () => Promise.resolve([]),
    });

    const result = await searchWithDeps({ query: "123" });

    expect(result).toEqual({
      certifications: [],
      professions: [],
    });
  });
});
