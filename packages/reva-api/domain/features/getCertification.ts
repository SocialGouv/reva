import { Certification } from "../types/search";

interface GetCertificationDependencies {
  getCertificationById: (params: { id: string; }) => Promise<Certification | null>;
}

export const getCertification =
  (deps: GetCertificationDependencies) =>
    async ({ id }: { id: string; }): Promise<Certification | null> => {
      return deps.getCertificationById({ id });
    }