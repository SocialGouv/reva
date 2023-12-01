"use client";
import { useAbsencePageQueries } from "@/app/account-settings/absence/absencePageQueries";
import { NotImplementedPage } from "@/app/account-settings/components/not-implemented-page/NotImplementedPage";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  structureVisible: z.enum(["oui", "non"]),
});

type FormData = z.infer<typeof schema>;

const AbsencePage = () => {
  const { isFeatureActive } = useFeatureflipping();

  const {
    organism,
    organismQueryStatus,
    refetchOrganism,
    updateFermePourAbsenceOuConges,
  } = useAbsencePageQueries();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const resetForm = useCallback(
    () =>
      reset({
        structureVisible: organism?.fermePourAbsenceOuConges ? "non" : "oui",
      }),
    [organism?.fermePourAbsenceOuConges, reset],
  );

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await updateFermePourAbsenceOuConges.mutateAsync({
      organismId: organism?.id,
      fermePourAbsenceOuConges: data.structureVisible === "non",
    });
    successToast("modifications enregistrées");
    await refetchOrganism();
  });

  return isFeatureActive("FERMETURE_AGENCE_POUR_ABSENCE_OU_CONGES") ? (
    <div className="flex flex-col">
      <h1 className="leading-6 font-bold text-2xl mb-8">
        Gestion des absences et fermetures
      </h1>

      {organismQueryStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pensant la récupération de l'agence."
        />
      )}

      {updateFermePourAbsenceOuConges.status === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pensant l'enregistrement de la visibilité de l'agence."
        />
      )}

      {organismQueryStatus === "success" && (
        <>
          <p className="text-xl">
            Si vous ne souhaitez plus recevoir de candidatures pendant un temps,
            ou si vous êtes en congés, vous allez pouvoir gérer vos absences et
            fermetures ici. En vous rendant non visible, vous n’apparaîtrez plus
            dans les résultats de recherches des candidats.
          </p>
          <form
            className="flex flex-col"
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              resetForm();
            }}
          >
            <fieldset className="mt-8">
              <RadioButtons
                legend="Rendre la structure visible dans les résultats"
                options={[
                  {
                    label: "Oui",
                    nativeInputProps: {
                      value: "oui",
                      ...register("structureVisible"),
                    },
                  },
                  {
                    label: "Non",
                    nativeInputProps: {
                      value: "non",
                      ...register("structureVisible"),
                    },
                  },
                ]}
              />
            </fieldset>

            <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8">
              <Button priority="secondary" type="reset">
                Annuler les modifications
              </Button>
              <Button disabled={isSubmitting}>Valider les modifications</Button>
            </div>
          </form>
        </>
      )}
    </div>
  ) : (
    <NotImplementedPage title="Gestion des absences et congés" />
  );
};

export default AbsencePage;
