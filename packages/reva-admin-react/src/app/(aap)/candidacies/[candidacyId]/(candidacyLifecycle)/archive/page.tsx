"use client";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { CandidacyForArchive, useArchive } from "./_components/useArchive";
import { useCandidacyStatus } from "../../_components/candidacy.hook";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useMemo } from "react";
import { CandidacyArchivalReason } from "@/graphql/generated/graphql";
import { isCandidacyStatusEqualOrAbove } from "@/utils/isCandidacyStatusEqualOrAbove";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useRouter } from "next/navigation";
import { FormButtons } from "@/components/form/form-footer/FormButtons";

const archiveSchema = z.object({
  archivalReason: z.enum(
    [
      "INACTIVITE_CANDIDAT",
      "MULTI_CANDIDATURES",
      "PASSAGE_AUTONOME_A_ACCOMPAGNE",
      "PROBLEME_FINANCEMENT",
      "REORIENTATION_HORS_FRANCE_VAE",
      "AUTRE",
    ],
    {
      message: "Merci de remplir ce champ",
    },
  ),
  archivalReasonAdditionalInformation: z.string().optional(),
});

type ArchiveFormData = z.infer<typeof archiveSchema>;

const CandidacyArchiveComponent = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForArchive>;
}) => {
  const { canBeArchived, candidacyCurrentActiveStatus } =
    useCandidacyStatus(candidacy);

  const router = useRouter();
  const { archiveCandidacy } = useArchive();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveSchema),
  });

  const archivalReason = useWatch({ control, name: "archivalReason" });

  const availableArchivalReasons: {
    value: CandidacyArchivalReason;
    label: string;
  }[] = useMemo(() => {
    const feasibilityResultKnown =
      isCandidacyStatusEqualOrAbove(
        candidacyCurrentActiveStatus,
        "DOSSIER_FAISABILITE_RECEVABLE",
      ) ||
      isCandidacyStatusEqualOrAbove(
        candidacyCurrentActiveStatus,
        "DOSSIER_FAISABILITE_NON_RECEVABLE",
      );

    return feasibilityResultKnown
      ? [
          { value: "MULTI_CANDIDATURES", label: "Multi-candidatures" },
          {
            value: "PASSAGE_AUTONOME_A_ACCOMPAGNE",
            label: "Passage autonome à accompagné",
          },
          { value: "AUTRE", label: "Autre" },
        ]
      : [
          {
            value: "INACTIVITE_CANDIDAT",
            label: "Inactivité du candidat",
          },
          {
            value: "REORIENTATION_HORS_FRANCE_VAE",
            label: "Ré-orientation hors France VAE",
          },
          { value: "PROBLEME_FINANCEMENT", label: "Problème de financement" },
          {
            value: "AUTRE",
            label: "Autre",
          },
        ];
  }, [candidacyCurrentActiveStatus]);

  if (candidacyCurrentActiveStatus === "ARCHIVE") {
    return (
      <Alert
        title=""
        severity="info"
        className="my-4"
        description={`La candidature est archivée. Réorientation : ${candidacy.reorientationReason?.label ?? "Le candidat n'a pas été réorienté"}`}
      />
    );
  }

  if (!canBeArchived) {
    return (
      <Alert
        title=""
        severity="warning"
        className="my-4"
        description="La candidature ne peut pas être archivée. Son statut ne le permet pas ou vous n'avez pas les permissions nécessaires."
      />
    );
  }

  const handleFormSubmit = handleSubmit(
    async (data) => {
      if (
        data.archivalReason === "AUTRE" &&
        !data.archivalReasonAdditionalInformation
      ) {
        setError("archivalReasonAdditionalInformation", {
          message: "Merci de remplir ce champ",
        });
      } else {
        try {
          await archiveCandidacy.mutateAsync(data);
          successToast("Modifications enregistrées");
          router.push(`/candidacies/${candidacy.id}/summary`);
        } catch (e) {
          graphqlErrorToast(e);
        }
      }
    },
    (e) => console.error(e),
  );

  return (
    <div className="flex flex-col gap-y-2">
      <FormOptionalFieldsDisclaimer />
      <p>
        L’archivage permet au candidat de refaire une candidature dans le cadre
        de France VAE (modification du diplôme, changement d’AAP, modification
        de ses coordonnées, …)
      </p>
      <form onSubmit={handleFormSubmit}>
        <RadioButtons
          options={availableArchivalReasons.map((r) => ({
            label: r.label,
            nativeInputProps: { value: r.value, ...register("archivalReason") },
          }))}
          state={errors.archivalReason ? "error" : "default"}
          stateRelatedMessage={errors.archivalReason?.message}
        />
        {archivalReason === "AUTRE" && (
          <Input
            label="S’il s’agit d’une autre raison, merci de l’indiquer ici :"
            nativeInputProps={{
              ...register("archivalReasonAdditionalInformation"),
            }}
            state={
              errors.archivalReasonAdditionalInformation ? "error" : "default"
            }
            stateRelatedMessage={
              errors.archivalReasonAdditionalInformation?.message
            }
          />
        )}
        <FormButtons
          backUrl={`/candidacies/${candidacy.id}/summary`}
          formState={{
            isDirty: isDirty,
            isSubmitting: isSubmitting,
          }}
        />
      </form>
    </div>
  );
};

const CandidacyArchivePage = () => {
  const { candidacy } = useArchive();

  if (!candidacy) {
    return null;
  }

  return (
    <>
      <h1>Archivage de la candidature</h1>
      <CandidacyArchiveComponent candidacy={candidacy} />
    </>
  );
};

export default CandidacyArchivePage;
