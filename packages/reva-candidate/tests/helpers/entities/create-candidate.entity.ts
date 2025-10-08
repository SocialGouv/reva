import { Candidacy, Candidate, Region } from "@/graphql/generated/graphql";

interface CreateCandidateWithCandidacyEntityOptions {
  candidacy?: Candidacy;
}

export const createCandidateEntity = (
  options?: CreateCandidateWithCandidacyEntityOptions,
) => {
  const { candidacy } = options || {};

  const candidate: Partial<Candidate> = {
    id: "1",
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    phone: "0601020304",
    department: {
      id: "75",
      label: "Paris",
      code: "75",
      region: {
        id: "11",
        label: "Île-de-France",
        code: "11",
      } as unknown as Region,
    },
  };

  if (candidacy) {
    candidate.candidacies = [candidacy];
    candidate.candidacy = candidacy;
  }

  return candidate;
};
