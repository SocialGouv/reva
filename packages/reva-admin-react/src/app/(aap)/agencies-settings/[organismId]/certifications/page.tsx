"use client";
import { useCertificationsPage } from "./certificationsPage.hook";
import { successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const schema = z.object({
  managedDegrees: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
});

type FormData = z.infer<typeof schema>;

const CertificationsPage = () => {
  const {
    organismId,
    degrees,
    degreesStatus,
    managedDegrees,
    managedDegreesStatus,
    refetchmanagedDegrees,
    createOrUpdatemanagedDegrees,
  } = useCertificationsPage();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields: managedDegreesFields } = useFieldArray({
    control,
    name: "managedDegrees",
  });

  const resetForm = useCallback(
    () =>
      reset({
        managedDegrees: degrees
          .filter((d) => d.level > 2)
          .map((d) => ({
            id: d.id,
            label: d.longLabel,
            checked: !!managedDegrees.find((md) => md.id === d.id),
          })),
      }),
    [managedDegrees, degrees, reset],
  );

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await createOrUpdatemanagedDegrees.mutateAsync({
      organismId,
      managedDegreesIds: data.managedDegrees
        .filter((md) => md.checked)
        .map((md) => md.id),
    });
    successToast("modifications enregistrées");
    await refetchmanagedDegrees();
  });

  return (
    <div className="flex flex-col flex-1">
      <h1>Gestion des certifications</h1>
      <h2>Niveaux de diplômes couverts par votre structure</h2>
      <Alert
        severity="info"
        title=""
        description={
          <>
            <p>
              Vous pouvez choisir les niveaux de certification pour lesquels
              vous souhaitez accompagner les démarches VAE correspondant à votre
              typologie AAP.
            </p>
            <p>
              Votre structure ne sera visible comme structure d'accompagnement
              que pour les niveaux de certification que vous avez sélectionnés.
            </p>
            <p>
              Il est à noter que vous devez continuer les accompagnements déjà
              en cours.
            </p>
          </>
        }
      />

      {degreesStatus === "error" ||
        (managedDegreesStatus === "error" && (
          <Alert
            className="my-6"
            severity="error"
            title="Une erreur est survenue pendant la récupération des niveaux de diplôme."
          />
        ))}

      {createOrUpdatemanagedDegrees.status === "error" && (
        <Alert
          className="my-6"
          severity="error"
          title="Une erreur est survenue pendant l'enregistrement des niveaux de diplôme."
        />
      )}

      {degreesStatus && managedDegreesStatus === "success" && (
        <form
          className="flex flex-col mt-6"
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
        >
          <fieldset className="flex flex-col gap-4">
            <Checkbox
              legend=""
              options={managedDegreesFields.map((md, mdIndex) => ({
                label: md.label,
                nativeInputProps: {
                  ...register(`managedDegrees.${mdIndex}.checked`),
                },
              }))}
            />
          </fieldset>

          <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8">
            <Button priority="secondary" type="reset">
              Annuler les modifications
            </Button>
            <Button disabled={isSubmitting}>Valider les modifications</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CertificationsPage;
