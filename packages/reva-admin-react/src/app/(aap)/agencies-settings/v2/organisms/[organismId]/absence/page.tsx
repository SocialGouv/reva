"use client";
import { successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAbsencePage } from "./absencePage.hook";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  structureVisible: z.enum(["oui", "non"]),
});

type FormData = z.infer<typeof schema>;

const AbsencePage = () => {
  const { organism, organismQueryStatus, updateFermePourAbsenceOuConges } =
    useAbsencePage();

  const queryClient = useQueryClient();

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
    queryClient.invalidateQueries({
      queryKey: [organism?.id],
    });
    successToast("modifications enregistrées");
  });

  if (organismQueryStatus !== "success" || !organism) {
    return <span>{organismQueryStatus}</span>;
  }

  return (
    <div className="flex flex-col">
      <h1>
        {`Visibilité ${
          organism.isHeadAgency ? "de la structure" : "du lieu d’accueil"
        }`}
      </h1>

      {updateFermePourAbsenceOuConges.status === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant l'enregistrement de la visibilité de l'agence."
        />
      )}

      <p className="text-xl">
        {`Vous ne souhaitez plus recevoir de candidatures temporairement ? Vous pouvez cacher momentanément ${
          organism.isHeadAgency ? "votre structure" : "le lieu d’accueil"
        } des résultats de recherche des candidats.`}
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
            legend={`Souhaitez-vous cacher votre ${organism.isHeadAgency ? "structure" : "lieu d'accueil"} dans les résultats de recherche ?`}
            options={[
              {
                label: "Oui",
                nativeInputProps: {
                  value: "non",
                  ...register("structureVisible"),
                },
              },
              {
                label: "Non",
                nativeInputProps: {
                  value: "oui",
                  ...register("structureVisible"),
                },
              },
            ]}
          />
        </fieldset>

        <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8">
          <Button priority="secondary" type="reset">
            Réinitialiser
          </Button>
          <Button disabled={isSubmitting}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
};

export default AbsencePage;
