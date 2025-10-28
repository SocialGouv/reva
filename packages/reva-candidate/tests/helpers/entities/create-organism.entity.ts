import { Organism } from "@/graphql/generated/graphql";

export const createOrganismEntity = (
  options: Partial<Organism> = {},
): Organism => {
  const organism: Organism = {
    id: options.id || "org-1",
    label: options.label || "Org Label",
    contactAdministrativeEmail:
      options.contactAdministrativeEmail || "org@example.test",
    contactAdministrativePhone:
      options.contactAdministrativePhone || "0102030405",
    nomPublic: options.nomPublic || "Org Public",
    emailContact: options.emailContact || "contact@example.test",
    telephone: options.telephone || "0102030405",
    adresseNumeroEtNomDeRue: options.adresseNumeroEtNomDeRue || "1 rue Test",
    adresseInformationsComplementaires:
      options.adresseInformationsComplementaires || "",
    adresseCodePostal: options.adresseCodePostal || "75000",
    adresseVille: options.adresseVille || "Paris",
    accounts: [],
    conventionCollectives: [],
    fermePourAbsenceOuConges: false,
    formacodes: [],
    isVisibleInCandidateSearchResults: true,
    managedDegrees: [],
    modaliteAccompagnement: options.modaliteAccompagnement || "LIEU_ACCUEIL",
    modaliteAccompagnementRenseigneeEtValide: true,
    remoteZones: [],
    maisonMereAAP: null,
    llToEarth: null,
    typology: "expertBrancheEtFiliere",
    disponiblePourVaeCollective: false,
  };
  return organism;
};
