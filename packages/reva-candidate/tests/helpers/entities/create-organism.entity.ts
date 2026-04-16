import { Organism } from "@/graphql/generated/graphql";

export const createOrganismEntity = (
  options: Partial<Organism> = {},
): Organism => {
  return {
    id: "org-1",
    label: "Org Label",
    contactAdministrativeEmail: "org@example.test",
    contactAdministrativePhone: "0102030405",
    nomPublic: "Org Public",
    emailContact: "contact@example.test",
    telephone: "0102030405",
    adresseNumeroEtNomDeRue: "1 rue Test",
    adresseInformationsComplementaires: "",
    adresseCodePostal: "75000",
    adresseVille: "Paris",
    accounts: [],
    conventionCollectives: [],
    fermePourAbsenceOuConges: false,
    formacodes: [],
    isVisibleInCandidateSearchResults: true,
    managedDegrees: [],
    modaliteAccompagnement: "LIEU_ACCUEIL",
    modaliteAccompagnementRenseigneeEtValide: true,
    remoteZones: [],
    maisonMereAAP: null,
    llToEarth: null,
    typology: "expertBrancheEtFiliere",
    disponiblePourVaeCollective: false,
    ...options,
  };
};
