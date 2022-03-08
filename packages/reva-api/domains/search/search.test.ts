import { searchCertificationsAndProfessions } from "./index";

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
