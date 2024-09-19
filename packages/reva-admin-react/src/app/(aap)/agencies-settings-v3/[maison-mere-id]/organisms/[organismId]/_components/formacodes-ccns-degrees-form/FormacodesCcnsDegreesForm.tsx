"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useFormacodesCcnsDegreesForm } from "./formacodesCcnsDegreesForm.hook";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useQueryClient } from "@tanstack/react-query";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import Accordion from "@codegouvfr/react-dsfr/Accordion";

const schema = z.object({
  organismDegrees: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
  organismConventionCollectives: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
  organismFormacodes: z.record(
    z.string(),
    z.object({
      id: z.string(),
      label: z.string(),
      checked: z.boolean(),
    }),
  ),
});

type FormData = z.infer<typeof schema>;

const FormacodesCcnsDegreesForm = ({
  organismId,
  backButtonUrl,
}: {
  organismId: string;
  backButtonUrl: string;
}) => {
  const {
    degrees,
    conventionCollectives,
    formacodes,
    organismManagedDegrees,
    organismConventionCollectives,
    organismFormacodes,
    organismTypology,
    organismAndReferentialStatus,
    updateOrganismDegreesAndFormacodes,
  } = useFormacodesCcnsDegreesForm({ organismId });

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

  const { fields: organismConventionCollectivesFields } = useFieldArray({
    control,
    name: "organismConventionCollectives",
  });

  const domains = useMemo(
    () => formacodes.filter((formacode) => formacode.type == "DOMAIN"),
    [formacodes],
  );

  const subDomains = useMemo(
    () => formacodes.filter((formacode) => formacode.type == "SUB_DOMAIN"),
    [formacodes],
  );

  const resetForm = useCallback(() => {
    organismAndReferentialStatus === "success" &&
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
        organismFormacodes: subDomains.reduce(
          (acc, d) => ({
            ...acc,
            [d.code]: {
              id: d.code,
              label: d.label,
              checked: !!organismFormacodes.find((od) => od.code === d.code),
            },
          }),
          {},
        ),
      });
  }, [
    organismAndReferentialStatus,
    reset,
    degrees,
    conventionCollectives,
    subDomains,
    organismManagedDegrees,
    organismConventionCollectives,
    organismFormacodes,
  ]);

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateOrganismDegreesAndFormacodes.mutateAsync({
        organismId,
        degreeIds: data.organismDegrees
          .filter((od) => od.checked)
          .map((od) => od.id),
        formacodeIds: Object.keys(data.organismFormacodes)
          .map((key) => data.organismFormacodes[key])
          .filter((od) => od.checked)
          .map((od) => od.id),
      });
      queryClient.invalidateQueries({
        queryKey: [organismId],
      });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
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

      {updateOrganismDegreesAndFormacodes.status === "error" && (
        <Alert
          className="my-6"
          severity="error"
          title="Une erreur est survenue pendant l'enregistrement des niveaux de diplôme."
        />
      )}

      {organismAndReferentialStatus === "success" && (
        <form
          className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-6"
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
        >
          <fieldset className="flex flex-col gap-4">
            <legend className="text-3xl font-bold mb-4">
              {organismTypology === "expertFiliere" && "Domaines"}
              {organismTypology === "expertBranche" && "Branches"}
              {organismTypology === "expertBrancheEtFiliere" &&
                "Domaines et branches"}
            </legend>

            {(organismTypology === "expertFiliere" ||
              organismTypology === "expertBrancheEtFiliere") &&
              domains.map((domain) => (
                <Accordion
                  className="before:shadow-none [&_div]:pb-0"
                  key={domain.code}
                  label={domain.label}
                  defaultExpanded
                >
                  <Checkbox
                    className="[&_label]:block [&_label]:first-letter:uppercase"
                    options={subDomains
                      .filter(
                        (subDomain) => subDomain.parentCode == domain.code,
                      )
                      .map((od) => ({
                        label: od.label,
                        nativeInputProps: {
                          ...register(`organismFormacodes.${od.code}.checked`),
                        },
                      }))}
                  />
                </Accordion>
              ))}
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

export default FormacodesCcnsDegreesForm;
