import Select from "@codegouvfr/react-dsfr/Select";

export type CandidateTypology =
  | "SALARIE_PRIVE"
  | "SALARIE_PUBLIC"
  | "DEMANDEUR_EMPLOI"
  | "BENEVOLE_OU_AIDANT_FAMILIAL"
  | "AUTRE";

export const CandidateTypologySelect = ({
  candidateTypology,
  onChange,
}: {
  candidateTypology?: CandidateTypology;
  onChange?(candidateTypology: CandidateTypology): void;
}) => (
  <Select
    data-testid="candidate-typology-select"
    className="basis-1/2"
    label="Votre statut"
    nativeSelectProps={{
      value: candidateTypology,
      onChange: (e) => onChange?.(e.target.value as CandidateTypology),
    }}
  >
    <option value={undefined} disabled selected></option>
    <option value="SALARIE_PRIVE">Je suis salarié du secteur privé</option>
    <option value="SALARIE_PUBLIC">Je suis salarié du secteur public</option>
    <option value="DEMANDEUR_EMPLOI">Je suis demandeur d'emploi</option>
    <option value="BENEVOLE_OU_AIDANT_FAMILIAL">
      Je suis bénévole / aidant familial
    </option>
    <option value="AUTRE">Autre</option>
  </Select>
);
