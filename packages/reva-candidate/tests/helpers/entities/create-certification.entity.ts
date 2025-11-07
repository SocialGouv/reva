import { Certification } from "@/graphql/generated/graphql";

export const createCertificationEntity = (
  options: Partial<Certification> = {},
) => {
  const certification: Certification = {
    id: options.id || "cert-1",
    label: options.label || "Certification Label",
    codeRncp: options.codeRncp || "RNCP0000",
    availableAt: new Date().getTime(),
    certificationAuthorities: [],
    competenceBlocs: [],
    conventionsCollectives: [],
    status: "VALIDE_PAR_CERTIFICATEUR",
    visible: true,
    typeDiplome: "Titre 2",
    degree: {
      id: "degree-1",
      code: "degree-1",
      label: "Degree 1",
      level: 1,
      longLabel: "Degree 1",
    },
    domains: [],
    rncpExpiresAt: new Date().getTime(),
    isAapAvailable: true,
    level: 1,
    prerequisites: [],
    ...options,
  };

  return certification;
};
