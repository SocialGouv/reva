import { useRouter } from "next/navigation";
import { useCandidacyStatus } from "../../../_components/candidacy.hook";
import { CandidacyForArchive, useArchive } from "./useArchive";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";

const archiveSchema = z.object({
  archivingReason: z.enum(
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
  archivingReasonAdditionalInformation: z.string().optional(),
});

type ArchiveFormData = z.infer<typeof archiveSchema>;

export const ArchiveCandidacyForm = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForArchive>;
}) => {
  const { canBeArchived } = useCandidacyStatus(candidacy);

  const router = useRouter();
  const { archiveCandidacy, availableArchivingReasons } = useArchive();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveSchema),
  });

  const archivingReason = useWatch({ control, name: "archivingReason" });

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
        data.archivingReason === "AUTRE" &&
        !data.archivingReasonAdditionalInformation
      ) {
        setError("archivingReasonAdditionalInformation", {
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
          options={availableArchivingReasons.map((r) => ({
            label: r.label,
            nativeInputProps: {
              value: r.value,
              ...register("archivingReason"),
            },
          }))}
          state={errors.archivingReason ? "error" : "default"}
          stateRelatedMessage={errors.archivingReason?.message}
        />
        {archivingReason === "AUTRE" && (
          <Input
            label="S’il s’agit d’une autre raison, merci de l’indiquer ici :"
            nativeInputProps={{
              ...register("archivingReasonAdditionalInformation"),
            }}
            state={
              errors.archivingReasonAdditionalInformation ? "error" : "default"
            }
            stateRelatedMessage={
              errors.archivingReasonAdditionalInformation?.message
            }
          />
        )}
        <FormButtons
          backUrl={`/candidacies/${candidacy.id}/summary`}
          hideResetButton
          formState={{
            isDirty: isDirty,
            isSubmitting: isSubmitting,
          }}
        />
      </form>
    </div>
  );
};
