import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

import {
  CandidacyStatusStep,
  JuryResultFilter,
  JuryStatusFilter,
} from "@/graphql/generated/graphql";

import { AnnuaireFilters } from "./annuaire.hook";

interface FiltersSectionProps {
  filters: AnnuaireFilters;
  cohortes: Array<{ id: string; nom: string }>;
  onToggleFeasibilityStatus: (status: CandidacyStatusStep) => void;
  onToggleValidationStatus: (status: CandidacyStatusStep) => void;
  onToggleJuryStatus: (status: JuryStatusFilter) => void;
  onToggleJuryResult: (result: JuryResultFilter) => void;
  onToggleMultipleJuryResults: (results: JuryResultFilter[]) => void;
  onToggleCohorte: (cohorteId: string) => void;
  onToggleIncludeDropouts: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const FiltersSection = ({
  filters,
  cohortes,
  onToggleFeasibilityStatus,
  onToggleValidationStatus,
  onToggleJuryStatus,
  onToggleJuryResult,
  onToggleMultipleJuryResults,
  onToggleCohorte,
  onToggleIncludeDropouts,
  onClearFilters,
  hasActiveFilters,
}: FiltersSectionProps) => {
  return (
    <div className="w-1/4 flex flex-col gap-4">
      <Accordion label="Dossier de faisabilité" className="bg-white">
        <Checkbox
          small
          options={[
            {
              label: "Nouveau dossier",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "DOSSIER_FAISABILITE_ENVOYE",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus("DOSSIER_FAISABILITE_ENVOYE"),
              },
            },
            {
              label: "Complet (En attente de recevabilité)",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "DOSSIER_FAISABILITE_COMPLET",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus("DOSSIER_FAISABILITE_COMPLET"),
              },
            },
            {
              label: "Incomplet",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "DOSSIER_FAISABILITE_INCOMPLET",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus("DOSSIER_FAISABILITE_INCOMPLET"),
              },
            },
            {
              label: "Recevable",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "DOSSIER_FAISABILITE_RECEVABLE",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus("DOSSIER_FAISABILITE_RECEVABLE"),
              },
            },
            {
              label: "Non recevable",
              nativeInputProps: {
                checked: filters.feasibilityStatuses.includes(
                  "DOSSIER_FAISABILITE_NON_RECEVABLE",
                ),
                onChange: () =>
                  onToggleFeasibilityStatus(
                    "DOSSIER_FAISABILITE_NON_RECEVABLE",
                  ),
              },
            },
          ]}
        />
      </Accordion>

      <Accordion label="Dossier de validation" className="bg-white">
        <Checkbox
          small
          options={[
            {
              label: "Reçu",
              nativeInputProps: {
                checked: filters.validationStatuses.includes(
                  "DOSSIER_DE_VALIDATION_ENVOYE",
                ),
                onChange: () =>
                  onToggleValidationStatus("DOSSIER_DE_VALIDATION_ENVOYE"),
              },
            },
            {
              label: "Signalé",
              nativeInputProps: {
                checked: filters.validationStatuses.includes(
                  "DOSSIER_DE_VALIDATION_SIGNALE",
                ),
                onChange: () =>
                  onToggleValidationStatus("DOSSIER_DE_VALIDATION_SIGNALE"),
              },
            },
          ]}
        />
      </Accordion>

      <Accordion label="Passage devant le jury" className="bg-white">
        <Checkbox
          small
          options={[
            {
              label: "A programmer",
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
          ]}
        />
      </Accordion>

      <Accordion label="Résultat de jury" className="bg-white">
        <Checkbox
          small
          options={[
            {
              label: "En attente de résultat",
              nativeInputProps: {
                checked: filters.juryResults.includes("AWAITING_RESULT"),
                onChange: () => onToggleJuryResult("AWAITING_RESULT"),
              },
            },
            {
              label: "Réussite totale",
              nativeInputProps: {
                checked:
                  filters.juryResults.includes(
                    "FULL_SUCCESS_OF_FULL_CERTIFICATION",
                  ) ||
                  filters.juryResults.includes(
                    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
                  ),
                onChange: () => {
                  onToggleMultipleJuryResults([
                    "FULL_SUCCESS_OF_FULL_CERTIFICATION",
                    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
                  ]);
                },
              },
            },
            {
              label: "Réussite partielle",
              nativeInputProps: {
                checked:
                  filters.juryResults.includes(
                    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
                  ) ||
                  filters.juryResults.includes(
                    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
                  ) ||
                  filters.juryResults.includes(
                    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
                  ),
                onChange: () => {
                  onToggleMultipleJuryResults([
                    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
                    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
                    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
                  ]);
                },
              },
            },
            {
              label: "Non validation",
              nativeInputProps: {
                checked: filters.juryResults.includes("FAILURE"),
                onChange: () => onToggleJuryResult("FAILURE"),
              },
            },
            {
              label: "Non présentation au jury",
              nativeInputProps: {
                checked:
                  filters.juryResults.includes("CANDIDATE_EXCUSED") ||
                  filters.juryResults.includes("CANDIDATE_ABSENT"),
                onChange: () => {
                  onToggleMultipleJuryResults([
                    "CANDIDATE_EXCUSED",
                    "CANDIDATE_ABSENT",
                  ]);
                },
              },
            },
          ]}
        />
      </Accordion>

      {cohortes.length > 0 && (
        <Accordion label="VAE Collective" className="bg-white">
          <Checkbox
            small
            options={cohortes.map((cohorte) => ({
              label: cohorte.nom,
              nativeInputProps: {
                checked: filters.cohorteIds.includes(cohorte.id),
                onChange: () => onToggleCohorte(cohorte.id),
              },
            }))}
          />
        </Accordion>
      )}

      <div className="py-4 border-b border-neutral-300">
        <ToggleSwitch
          label="Afficher les candidatures abandonnées"
          inputTitle="Afficher les candidatures abandonnées"
          labelPosition="left"
          checked={filters.includeDropouts}
          onChange={onToggleIncludeDropouts}
        />
      </div>

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
