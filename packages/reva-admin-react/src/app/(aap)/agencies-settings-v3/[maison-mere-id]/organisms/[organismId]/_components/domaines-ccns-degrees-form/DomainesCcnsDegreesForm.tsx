"use client";
import { successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useDomainesCcnsDegreesForm } from "./domainesCcnsDegreesForm.hook";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useQueryClient } from "@tanstack/react-query";
import { FormButtons } from "@/components/form/form-footer/FormButtons";

const schema = z.object({
  organismDegrees: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
  organismConventionCollectives: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
  organismDomaines: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
});

type FormData = z.infer<typeof schema>;

const DomainesCcnsDegreesForm = ({
  organismId,
  backButtonUrl,
}: {
  organismId: string;
  backButtonUrl: string;
}) => {
  const {
    degrees,
    conventionCollectives,
    domaines,
    organismManagedDegrees,
    organismConventionCollectives,
    organismDomaines,
    organismTypology,
    organismAndReferentialStatus,
    updateOrganismDegreesAndDomaines,
  } = useDomainesCcnsDegreesForm({ organismId });

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields: organismDegreesFields } = useFieldArray({
    control,
    name: "organismDegrees",
  });

  const { fields: organismDomainesFields } = useFieldArray({
    control,
    name: "organismDomaines",
  });

  const { fields: organismConventionCollectivesFields } = useFieldArray({
    control,
    name: "organismConventionCollectives",
  });

  const resetForm = useCallback(() => {
    if (organismAndReferentialStatus === "success") {
      reset({
        organismDegrees: degrees
          .filter((d) => d.level > 2)
          .map((d) => ({
            id: d.id,
            label: d.longLabel,
            checked: !!organismManagedDegrees.find((omd) => omd.id === d.id),
          })),
        organismConventionCollectives: conventionCollectives.map((c) => ({
          id: c.id,
          label: c.label,
          checked: !!organismConventionCollectives.find((oc) => oc.id === c.id),
        })),
        organismDomaines: domaines.map((d) => ({
          id: d.id,
          label: d.label,
          checked: !!organismDomaines.find((od) => od.id === d.id),
        })),
      });
    }
  }, [
    organismAndReferentialStatus,
    reset,
    degrees,
    conventionCollectives,
    domaines,
    organismManagedDegrees,
    organismConventionCollectives,
    organismDomaines,
  ]);

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await updateOrganismDegreesAndDomaines.mutateAsync({
      organismId,
      degreeIds: data.organismDegrees
        .filter((od) => od.checked)
        .map((od) => od.id),
      domaineIds: data.organismDomaines
        .filter((od) => od.checked)
        .map((od) => od.id),
    });
    queryClient.invalidateQueries({
      queryKey: [organismId],
    });
    successToast("modifications enregistrées");
  });

  return (
    <div className="flex flex-col flex-1">
      {organismAndReferentialStatus === "error" && (
        <Alert
          className="my-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération des niveaux de diplôme."
        />
      )}

      {updateOrganismDegreesAndDomaines.status === "error" && (
        <Alert
          className="my-6"
          severity="error"
          title="Une erreur est survenue pendant l'enregistrement des niveaux de diplôme."
        />
      )}

      {organismAndReferentialStatus === "success" && (
        <form
          className="grid grid-cols-1 md:grid-cols-2 mt-6"
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
        >
          <fieldset className="flex flex-col gap-4">
            <legend className="text-3xl font-bold mb-4">
              {organismTypology === "expertFiliere" && "Filières"}
              {organismTypology === "expertBranche" && "Branches"}
              {organismTypology === "expertBrancheEtFiliere" &&
                "Filières et branches"}
            </legend>
            {(organismTypology === "expertFiliere" ||
              organismTypology === "expertBrancheEtFiliere") && (
              <Checkbox
                legend={
                  <p className="text-sm">
                    Quelles sont les filières que vous couvrez ?
                  </p>
                }
                options={organismDomainesFields.map((od, odIndex) => ({
                  label: od.label,
                  nativeInputProps: {
                    ...register(`organismDomaines.${odIndex}.checked`),
                  },
                }))}
              />
            )}
            {(organismTypology === "expertBranche" ||
              organismTypology === "expertBrancheEtFiliere") && (
              <div className="flex flex-col">
                <Checkbox
                  legend={
                    <p className="text-sm">
                      Quelles sont les branches que vous couvrez ?
                    </p>
                  }
                  disabled
                  options={organismConventionCollectivesFields.map(
                    (oc, ocIndex) => ({
                      label: oc.label,
                      nativeInputProps: {
                        ...register(
                          `organismConventionCollectives.${ocIndex}.checked`,
                        ),
                      },
                    }),
                  )}
                />
                <SmallNotice>
                  Vous souhaitez modifier vos branches ? <br />
                  Adressez-vous directement au support à support@vae.gouv.fr.
                </SmallNotice>
              </div>
            )}
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="text-3xl font-bold mb-4">
              Niveaux de certification
            </legend>
            <Checkbox
              legend={
                <p className="text-sm">
                  Quels sont les niveaux de certification que vous couvrez ?
                </p>
              }
              options={organismDegreesFields.map((od, odIndex) => ({
                label: od.label,
                nativeInputProps: {
                  ...register(`organismDegrees.${odIndex}.checked`),
                },
              }))}
            />
          </fieldset>
          <FormButtons
            className="col-span-2"
            formState={{ isSubmitting, isDirty }}
            backUrl={backButtonUrl}
          />
        </form>
      )}
    </div>
  );
};

export default DomainesCcnsDegreesForm;
