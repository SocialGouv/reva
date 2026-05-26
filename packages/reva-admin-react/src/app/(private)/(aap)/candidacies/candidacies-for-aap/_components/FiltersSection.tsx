import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { AnnuaireFilters } from "./annuaire.hook";

interface FiltersSectionProps {
  filters: AnnuaireFilters;
  onToggleCandidacyStatus: (status: CandidacyStatusStep) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FiltersSection = ({
  filters,
  onToggleCandidacyStatus,
  onClearFilters,
  hasActiveFilters,
}: FiltersSectionProps) => {
  return (
    <div className="flex w-[282px] shrink-0 flex-col gap-4">
      <Accordion label="Candidatures" className="bg-white" defaultExpanded>
        <Checkbox
          small
          className="mb-0"
          options={[
            {
              label: "Nouvelles",
              nativeInputProps: {
                checked: filters.candidacyStatuses.includes("PROJET"),
                onChange: () => onToggleCandidacyStatus("PROJET"),
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
