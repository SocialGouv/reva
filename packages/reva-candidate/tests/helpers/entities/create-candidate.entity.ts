import { Candidacy, Candidate } from "@/graphql/generated/graphql";

// Avoid deep cycles (Candidate <-> Candidacy) in tests:
export type CandidateEntity = Omit<Candidate, "candidacy" | "candidacies"> & {
  candidacy: Candidacy | null;
  candidacies: Candidacy[];
};

type CreateCandidateEntityOptions = Partial<CandidateEntity>;

const defaultDepartment = {
  id: "id-paris",
  label: "Paris",
  code: "75",
  timezone: "Europe/Paris",
};

export const createCandidateEntity = (
  options: CreateCandidateEntityOptions = {},
): CandidateEntity => {
  const {
    candidacy: candidacyOption = null,
    candidacies,
    ...candidateOverrides
  } = options;

  return {
    id: "1",
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    phone: "0601020304",
    department: defaultDepartment,
    candidacy: candidacyOption,
    candidacies: candidacies ?? (candidacyOption ? [candidacyOption] : []),
    ...candidateOverrides,
  };
};
