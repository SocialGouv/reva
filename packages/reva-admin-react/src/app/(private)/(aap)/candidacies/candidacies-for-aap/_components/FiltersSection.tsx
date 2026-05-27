import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { useAuth } from "@/components/auth/auth";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { AnnuaireFilters } from "./annuaire.hook";

interface FiltersSectionProps {
  filters: AnnuaireFilters;
  onToggleCandidacyStatus: (status: CandidacyStatusStep) => void;
  onToggleTrainingStatus: (status: CandidacyStatusStep) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FiltersSection = ({
  filters,
  onToggleCandidacyStatus,
  onToggleTrainingStatus,
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
