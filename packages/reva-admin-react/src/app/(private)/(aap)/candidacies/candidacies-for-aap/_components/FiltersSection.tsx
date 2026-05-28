import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { useAuth } from "@/components/auth/auth";

import {
  CandidacyStatusStep,
  FeasibilityStatusFilter,
  DossierDeValidationStatusFilter,
  JuryStatusFilter,
} from "@/graphql/generated/graphql";

import { AnnuaireFilters } from "./annuaire.hook";

interface FiltersSectionProps {
  filters: AnnuaireFilters;
  onToggleCandidacyStatus: (status: CandidacyStatusStep) => void;
  onToggleTrainingStatus: (status: CandidacyStatusStep) => void;
  onToggleFeasibilityStatus: (status: FeasibilityStatusFilter) => void;
  onToggleDossierDeValidationStatus: (
    status: DossierDeValidationStatusFilter,
  ) => void;
  onToggleJuryStatus: (status: JuryStatusFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FiltersSection = ({
  filters,
  onToggleCandidacyStatus,
  onToggleTrainingStatus,
  onToggleFeasibilityStatus,
  onToggleDossierDeValidationStatus,
  onToggleJuryStatus,
  onClearFilters,
  hasActiveFilters,
}: FiltersSectionProps) => {
  const { isAdmin } = useAuth();

  return (
    <div className="flex w-[282px] shrink-0 flex-col gap-4">
      <Accordion label="Candidatures" className="bg-white" defaultExpanded>
        <Checkbox
          small
          className="mb-0"
          options={[
            ...(isAdmin
              ? [
                  {
                    label: "Nouvelles candidatures autonomes",
                    nativeInputProps: {
                      checked: filters.candidacyStatuses.includes("PROJET"),
                      onChange: () => onToggleCandidacyStatus("PROJET"),
                    },
                  },
                ]
              : []),
            {
              label: "Nouvelles",
              nativeInputProps: {
                checked: filters.candidacyStatuses.includes("VALIDATION"),
                onChange: () => onToggleCandidacyStatus("VALIDATION"),
              },
            },
            {
              label: "Consultées",
              nativeInputProps: {
                checked: filters.candidacyStatuses.includes("PRISE_EN_CHARGE"),
                onChange: () => onToggleCandidacyStatus("PRISE_EN_CHARGE"),
              },
            },
          ]}
        />
      </Accordion>

      <Accordion
        label="Parcours et financement"
        className="bg-white"
        defaultExpanded
      >
        <Checkbox
          small
          className="mb-0"
          options={[
            {
              label: "Envoyé au candidat",
              nativeInputProps: {
                checked: filters.trainingStatuses.includes("PARCOURS_ENVOYE"),
                onChange: () => onToggleTrainingStatus("PARCOURS_ENVOYE"),
              },
            },
            {
              label: "Validé par le candidat",
              nativeInputProps: {
                checked: filters.trainingStatuses.includes("PARCOURS_CONFIRME"),
                onChange: () => onToggleTrainingStatus("PARCOURS_CONFIRME"),
              },
            },
          ]}
        />
      </Accordion>

      <Accordion
        label="Dossier de faisabilité"
        className="bg-white"
        defaultExpanded
      >
        <Checkbox
          small
          className="mb-0"
          options={[
            {
              label: "Envoyé au candidat",
              nativeInputProps: {
                checked:
                  filters.feasibilityStatuses.includes("ENVOYE_AU_CANDIDAT"),
                onChange: () => onToggleFeasibilityStatus("ENVOYE_AU_CANDIDAT"),
              },
            },
            {
              label: "Partiellement validé",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "PARTIELLEMENT_VALIDE_PAR_LE_CANDIDAT",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus(
                    "PARTIELLEMENT_VALIDE_PAR_LE_CANDIDAT",
                  ),
              },
            },
            {
              label: "Validé par le candidat",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "VALIDE_PAR_LE_CANDIDAT",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus("VALIDE_PAR_LE_CANDIDAT"),
              },
            },
            {
              label: "Envoyé au certificateur",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "ENVOYE_AU_CERTIFICATEUR",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus("ENVOYE_AU_CERTIFICATEUR"),
              },
            },
            {
              label: "Incomplet",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes("INCOMPLET"),
                onChange: () => onToggleFeasibilityStatus("INCOMPLET"),
              },
            },
            {
              label: "Recevable",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes("RECEVABLE"),
                onChange: () => onToggleFeasibilityStatus("RECEVABLE"),
              },
            },
          ]}
        />
      </Accordion>

      <Accordion
        label="Dossier de validation"
        className="bg-white"
        defaultExpanded
      >
        <Checkbox
          small
          className="mb-0"
          options={[
            {
              label: "À transmettre",
              nativeInputProps: {
                checked:
                  filters.dossierDeValidationStatuses.includes("TRANSMETTRE"),
                onChange: () =>
                  onToggleDossierDeValidationStatus("TRANSMETTRE"),
              },
            },
            {
              label: "Envoyé",
              nativeInputProps: {
                checked: filters.dossierDeValidationStatuses.includes("ENVOYE"),
                onChange: () => onToggleDossierDeValidationStatus("ENVOYE"),
              },
            },
            {
              label: "Signalé",
              nativeInputProps: {
                checked:
                  filters.dossierDeValidationStatuses.includes("SIGNALE"),
                onChange: () => onToggleDossierDeValidationStatus("SIGNALE"),
              },
            },
          ]}
        />
      </Accordion>

      <Accordion
        label="Passage devant le jury"
        className="bg-white"
        defaultExpanded
      >
        <Checkbox
          small
          className="mb-0"
          options={[
            {
              label: "En attente d'une date",
              nativeInputProps: {
                checked: filters.juryStatuses.includes("TO_SCHEDULE"),
                onChange: () => onToggleJuryStatus("TO_SCHEDULE"),
              },
            },
            {
              label: "Programmé",
              nativeInputProps: {
                checked: filters.juryStatuses.includes("SCHEDULED"),
                onChange: () => onToggleJuryStatus("SCHEDULED"),
              },
            },
            {
              label: "Passé",
              nativeInputProps: {
                checked: filters.juryStatuses.includes("PASSED"),
                onChange: () => onToggleJuryStatus("PASSED"),
              },
            },
          ]}
        />
      </Accordion>

      {hasActiveFilters && (
        <Button
          priority="tertiary no outline"
          onClick={onClearFilters}
          className="self-start"
        >
          Effacer les filtres
        </Button>
      )}
    </div>
  );
};
