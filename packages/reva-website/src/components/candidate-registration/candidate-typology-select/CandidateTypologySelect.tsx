import Select from "@codegouvfr/react-dsfr/Select";

export type CandidateTypology =
  | "NON_SPECIFIE"
  | "SALARIE_PRIVE"
  | "SALARIE_PUBLIC"
  | "BENEVOLE"
  | "AIDANTS_FAMILIAUX"
  | "AIDANTS_FAMILIAUX_AGRICOLES"
  | "DEMANDEUR_EMPLOI"
  | "TRAVAILLEUR_NON_SALARIE"
  | "RETRAITE"
  | "TITULAIRE_MANDAT_ELECTIF"
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
    className="basis-1/2 !mb-0"
    label="Votre statut"
    nativeSelectProps={{
      value: candidateTypology || "NON_SPECIFIE",
      onChange: (e) => onChange?.(e.target.value as CandidateTypology),
    }}
  >
    <option value="NON_SPECIFIE" disabled>
      Sélectionner
    </option>
    <option value="SALARIE_PRIVE">Je suis salarié du secteur privé</option>
    <option value="SALARIE_PUBLIC">Je suis salarié du secteur public</option>
    <option value="BENEVOLE">Je suis bénévole</option>
    <option value="AIDANTS_FAMILIAUX">Je suis aidant familial</option>
    <option value="AIDANTS_FAMILIAUX_AGRICOLES">
      Je suis aidant familial agricole
    </option>
    <option value="DEMANDEUR_EMPLOI">Je suis demandeur d'emploi</option>
    <option value="TRAVAILLEUR_NON_SALARIE">
      Je suis travailleur non salarié
    </option>
    <option value="RETRAITE">Je suis retraité</option>
    <option value="TITULAIRE_MANDAT_ELECTIF">
      Je suis titulaire d'un mandat électif (électoral ou syndical)
    </option>
    <option value="AUTRE">Autre</option>
  </Select>
);
