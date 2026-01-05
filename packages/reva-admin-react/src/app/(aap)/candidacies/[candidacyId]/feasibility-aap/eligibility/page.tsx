"use client";

import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { isBefore, parseISO, toDate } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedOptionalText } from "@/utils/input-sanitization";

import { useEligibility } from "./_components/eligibility.hook";

const schema = z
  .object({
    eligibility: z.enum(
      [
        "",
        "PREMIERE_DEMANDE_RECEVABILITE",
        "DETENTEUR_RECEVABILITE",
        "DETENTEUR_RECEVABILITE_AVEC_CHGT_CODE_RNCP_ET_REV_REFERENTIEL",
        "DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL",
      ],
      {
        invalid_type_error: "Veuillez sélectionner une situation",
      },
    ),
    eligibilityValidUntil: sanitizedOptionalText(),
    timeEnough: z.enum(["", "true", "false"]).optional(),
  })
  .superRefine(({ eligibility, eligibilityValidUntil, timeEnough }, ctx) => {
    if (!eligibility) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Veuillez sélectionner une situation",
        path: ["eligibility"],
      });
    }

    if (
      eligibility === "DETENTEUR_RECEVABILITE" ||
      eligibility === "DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL"
    ) {
      if (!eligibilityValidUntil) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Veuillez sélectionner une date de fin de validité",
          path: ["eligibilityValidUntil"],
        });
      } else if (isBefore(toDate(eligibilityValidUntil), new Date())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Merci d'indiquer une date postérieure à la date du jour",
          path: ["eligibilityValidUntil"],
        });
      }

      if (timeEnough === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Veuillez répondre à la question",
          path: ["timeEnough"],
        });
      }
    }
  });

type DecisionForm = z.infer<typeof schema>;

const eligibilityRequirementMap = (
  eligibility: DecisionForm["eligibility"],
  timeEnough: DecisionForm["timeEnough"],
): "FULL_ELIGIBILITY_REQUIREMENT" | "PARTIAL_ELIGIBILITY_REQUIREMENT" => {
  if (
    (eligibility === "DETENTEUR_RECEVABILITE" ||
      eligibility ===
        "DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL") &&
    timeEnough === "true"
  ) {
    return "PARTIAL_ELIGIBILITY_REQUIREMENT";
  }
  return "FULL_ELIGIBILITY_REQUIREMENT";
};

export default function EligibilityPage() {
  const { candidacyId } = useParams<{ candidacyId: string }>();
  const router = useRouter();
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;
  const { certification, createOrUpdateEligibilityRequirement } =
    useEligibility();
  const defaultValues = useMemo(
    () => ({
      eligibility: "" as const,
      eligibilityValidUntil: undefined,
      timeEnough: "" as const,
    }),
    [],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
    watch,
  } = useForm<DecisionForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const eligibility = watch("eligibility");

  const areOptionalFieldsDisabled = !(
    eligibility === "DETENTEUR_RECEVABILITE" ||
    eligibility === "DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL"
  );

  const handleFormSubmit = async ({
    eligibility,
    eligibilityValidUntil,
    timeEnough,
  }: DecisionForm) => {
    const eligibilityRequirement = eligibilityRequirementMap(
      eligibility,
      timeEnough,
    );

    const eligibilityValidUntilDate =
      eligibilityValidUntil &&
      eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT"
        ? parseISO(eligibilityValidUntil).getTime()
        : undefined;

    const input = {
      eligibilityRequirement,
      eligibilityValidUntil: eligibilityValidUntilDate,
      eligibilityCandidateSituation: eligibility || undefined,
    };

    try {
      await createOrUpdateEligibilityRequirement(input);
      successToast("Recevabilité du candidat enregistré");
      router.push(feasibilitySummaryUrl);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const resetForm = useCallback(
    () => reset(defaultValues),
    [reset, defaultValues],
  );

  useEffect(resetForm, [resetForm]);

  return (
    <div className="flex flex-col">
      <h1>Recevabilité du candidat</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">
        Avant de commencer un dossier de faisabilité, vous devez vérifier si
        votre candidat a déjà une recevabilité favorable en cours. Si c’est le
        cas, vous accéderez à une version adaptée du dossier de faisabilité.
      </p>

      <div className="flex ">
        <span className={`fr-icon fr-icon--lg fr-icon-award-fill mr-2`} />
        <div>
          <p className="text-xl font-bold mb-0">{certification?.label}</p>
          <p className="text-xs text-dsfr-light-text-mention-grey mb-0">
            RNCP {certification?.codeRncp}
          </p>
        </div>
      </div>
      <hr className="mt-8 mb-2" />
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={(e) => {
          e.preventDefault();
          resetForm();
        }}
      >
        <Select
          state={errors.eligibility ? "error" : "default"}
          stateRelatedMessage={errors.eligibility?.message}
          label="Situation du candidat"
          hint="Sélectionnez le cas dans lequel se trouve votre candidat actuellement"
          nativeSelectProps={{ ...register("eligibility"), defaultValue: "" }}
          data-testid="eligibility-select"
        >
          <option value={undefined} disabled>
            Choisir une situation
          </option>
          <option value="PREMIERE_DEMANDE_RECEVABILITE">
            Première demande de recevabilité pour cette certification
          </option>
          <option value="DETENTEUR_RECEVABILITE">
            Détenteur d'une recevabilité
          </option>
          <option value="DETENTEUR_RECEVABILITE_AVEC_CHGT_CODE_RNCP_ET_REV_REFERENTIEL">
            Détenteur d'une recevabilité avec changement de code RNCP et
            révision du référentiel
          </option>
          <option value="DETENTEUR_RECEVABILITE_AVEC_REV_SANS_CHGT_REFERENTIEL">
            Détenteur d'une recevabilité avec révision sans changement de
            référentiel
          </option>
        </Select>

        <Input
          className="max-w-xs mt-4"
          label="Date de fin de validité "
          hintText="Date au format 31/12/2022"
          nativeInputProps={{
            type: "date",
            ...register("eligibilityValidUntil"),
          }}
          disabled={areOptionalFieldsDisabled}
          state={errors.eligibilityValidUntil ? "error" : "default"}
          stateRelatedMessage={errors.eligibilityValidUntil?.message}
          data-testid="eligibility-valid-until-input"
        />

        <RadioButtons
          orientation="horizontal"
          disabled={areOptionalFieldsDisabled}
          legend="Le candidat est-il en capacité de déposer son dossier de validation avant la fin de la date de validité ?"
          options={[
            {
              label: "Oui",
              nativeInputProps: {
                ...register("timeEnough"),
                value: "true",
              },
            },
            {
              label: "Non",
              nativeInputProps: {
                ...register("timeEnough"),
                value: "false",
              },
            },
          ]}
          state={errors.timeEnough ? "error" : "default"}
          stateRelatedMessage={errors.timeEnough?.message}
          data-testid="eligibility-time-enough-radio-buttons"
        />

        <CallOut title="Bon à savoir">
          Si vous déposez le dossier de validation du candidat au-delà de la
          date de fin de validité, il pourrait ne pas être accepté par le
          certificateur.
        </CallOut>

        <FormButtons
          backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
          formState={{
            isDirty,
            isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
