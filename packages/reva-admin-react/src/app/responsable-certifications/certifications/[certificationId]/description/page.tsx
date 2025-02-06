"use client";
import { ReactNode } from "react";
import { format } from "date-fns";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import Input from "@codegouvfr/react-dsfr/Input";

import { zodResolver } from "@hookform/resolvers/zod";

import { useUpdateCertificationDescriptionPage } from "./updateCertificationDescription.hook";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Select from "@codegouvfr/react-dsfr/Select";

import {
  CertificationJuryModality,
  CertificationJuryFrequency,
} from "@/graphql/generated/graphql";

const EvaluationModalities: { id: CertificationJuryModality; label: string }[] =
  [
    {
      id: "PRESENTIEL",
      label: "Présentiel",
    },
    {
      id: "A_DISTANCE",
      label: "À distance",
    },
    {
      id: "MISE_EN_SITUATION_PROFESSIONNELLE",
      label: "Mise en situation professionnelle",
    },
    {
      id: "ORAL",
      label: "Oral",
    },
  ];

const JuryFrequencies: { id: CertificationJuryFrequency; label: string }[] = [
  {
    id: "MONTHLY",
    label: "Tous les mois",
  },
  {
    id: "TRIMESTERLY",
    label: "Trimestrielle",
  },
  {
    id: "YEARLY",
    label: "1 fois / an",
  },
];

const zodSchema = z
  .object({
    juryModalities: z
      .object({ id: z.string(), label: z.string(), checked: z.boolean() })
      .array(),
    juryFrequency: z.enum([
      "",
      ...JuryFrequencies.map(({ id }) => id),
      "Autre",
    ]),
    juryFrequencyOther: z.string().optional(),
    juryPlace: z.string().optional(),
    juryEstimatedCost: z.number(),
    startOfVisibility: z.string({
      invalid_type_error: "Champs requis",
    }),
    endOfVisibility: z.string({
      invalid_type_error: "Champs requis",
    }),
  })
  .superRefine(
    (
      {
        juryModalities,
        juryFrequency,
        juryFrequencyOther,
        startOfVisibility,
        endOfVisibility,
      },
      { addIssue },
    ) => {
      if (juryModalities.findIndex((v) => v.checked) == -1) {
        addIssue({
          path: ["juryModalities"],
          message: "Veuillez séléctionner au moins une option",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!juryFrequency) {
        addIssue({
          path: ["juryFrequency"],
          message: "Veuillez renseigner ce champ",
          code: z.ZodIssueCode.custom,
        });
        return;
      } else if (juryFrequency == "Autre" && !juryFrequencyOther) {
        addIssue({
          path: ["juryFrequencyOther"],
          message: "Veuillez renseigner ce champ",
          code: z.ZodIssueCode.custom,
        });

        return;
      }

      if (isNaN(Date.parse(startOfVisibility))) {
        addIssue({
          path: ["startOfVisibility"],
          message: "Veuillez renseigner ce champ",
          code: z.ZodIssueCode.custom,
        });
      }

      if (isNaN(Date.parse(endOfVisibility))) {
        addIssue({
          path: ["endOfVisibility"],
          message: "Veuillez renseigner ce champ",
          code: z.ZodIssueCode.custom,
        });
      }
    },
  );

type CompanySiretStepFormSchema = z.infer<typeof zodSchema>;

type CertificationForPage = Exclude<
  ReturnType<typeof useUpdateCertificationDescriptionPage>["certification"],
  undefined
>;

export default function UpdateCertificationDescriptionForCertificationRegistryManagerPage() {
  const { certificationId } = useParams<{
    certificationId: string;
  }>();

  const {
    certification,
    getCertificationQueryStatus,
    updateCertificationDescription,
  } = useUpdateCertificationDescriptionPage({ certificationId });

  return getCertificationQueryStatus === "success" && certification ? (
    <PageContent
      certification={certification}
      updateCertificationDescription={updateCertificationDescription}
    />
  ) : null;
}

const PageContent = ({
  certification,
  updateCertificationDescription,
}: {
  certification: CertificationForPage;
  updateCertificationDescription: ReturnType<
    typeof useUpdateCertificationDescriptionPage
  >["updateCertificationDescription"];
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, isDirty, errors },
    watch,
  } = useForm<CompanySiretStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      juryModalities: EvaluationModalities.map((modality) => ({
        id: modality.id,
        label: modality.label,
        checked: certification.juryModalities.includes(modality.id),
      })),

      juryFrequency: certification.juryFrequencyOther
        ? "Autre"
        : certification.juryFrequency || "",
      juryFrequencyOther: certification.juryFrequencyOther || undefined,

      juryPlace: certification.juryPlace || undefined,

      juryEstimatedCost: certification.juryEstimatedCost || undefined,

      startOfVisibility: certification.availableAt
        ? format(certification.availableAt, "yyyy-MM-dd")
        : undefined,
      endOfVisibility: certification.expiresAt
        ? format(certification.expiresAt, "yyyy-MM-dd")
        : certification.rncpExpiresAt
          ? format(certification.rncpExpiresAt, "yyyy-MM-dd")
          : undefined,
    },
  });

  const juryFrequency = watch("juryFrequency");
  const { fields: juryModalities } = useFieldArray({
    control,
    name: "juryModalities",
  });

  const handleFormSubmit = handleSubmit(
    async (data) => {
      try {
        const frequency =
          JuryFrequencies.find(({ id }) => id == data.juryFrequency)?.id ||
          null;

        await updateCertificationDescription.mutateAsync({
          certificationId: certification.id,
          juryModalities: data.juryModalities
            .filter((modality) => modality.checked)
            .map((modality) => modality.id) as CertificationJuryModality[],
          juryFrequency: frequency,
          juryFrequencyOther: frequency ? null : data.juryFrequencyOther,
          juryPlace: data.juryPlace,
          juryEstimatedCost: data.juryEstimatedCost,
          availableAt: new Date(data.startOfVisibility).getTime(),
          expiresAt: new Date(data.endOfVisibility).getTime(),
        });

        successToast("La certification a bien été ajoutée");

        router.push(
          `/responsable-certifications/certifications/${certification.id}`,
        );
      } catch (error) {
        graphqlErrorToast(error);
      }
    },
    (errors) => {
      console.log("errors", errors);
    },
  );

  return (
    <div data-test="certification-registry-manager-update-certification-description-page">
      <h1>Descriptif de la certification</h1>
      <p className="mb-12 text-xl">
        Complétez ou modifiez les informations concernant cette certification.
        Une fois la certification validée et visible, ces informations seront
        disponibles pour les AAP et les candidats.
      </p>

      <div className="flex flex-col gap-8">
        <EnhancedSectionCard
          data-test="certification-description-card"
          title={`Informations liées au code RNCP ${certification.codeRncp}`}
          status="TO_COMPLETE"
        >
          <div className="flex flex-col gap-4">
            <h3 className="m-0">
              Descriptif de la certification dans France compétences
            </h3>
            <Info title="Intitulé">{certification.label}</Info>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info title="Niveau">{certification.degree.label}</Info>
              <Info title="Type">{certification.typeDiplome || "Inconnu"}</Info>
              <Info title="Date de publication">
                {certification.rncpPublishedAt
                  ? format(certification.rncpPublishedAt, "dd/MM/yyyy")
                  : "Inconnue"}
              </Info>
              <Info title="Date d'échéance">
                {certification.rncpDeliveryDeadline
                  ? format(certification.rncpDeliveryDeadline, "dd/MM/yyyy")
                  : "Inconnue"}
              </Info>
            </div>

            <h3 className="m-0">Domaines et sous-domaines du Formacode </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certification.domains.length == 0 && (
                <div>Aucun formacode associé</div>
              )}
              {certification.domains.map((domain) => (
                <div key={domain.id} className="flex flex-col gap-2">
                  <div>{domain.label}</div>
                  <div
                    key={domain.id}
                    className="flex flex-row flex-wrap gap-2"
                  >
                    {domain.children.map((subDomain) => (
                      <Tag key={subDomain.id}>
                        {`${subDomain.code} ${subDomain.label}`}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Notice
              className="bg-transparent -ml-6 text-xs p-0 mt-2"
              title={
                <span className="text-sm inline font-normal">
                  Vous trouverez dans cette section des informations à compléter
                  et d’autres non modifiables. En cas d’erreur, contactez
                  directement France compétences.
                </span>
              }
            />
          </div>
        </EnhancedSectionCard>

        <form id="CertificationDescriptionForm" onSubmit={handleFormSubmit}>
          <div className="flex flex-col gap-8">
            <h2 className="m-0">Informations complémentaires</h2>
            <div className="flex flex-col gap-6">
              <h3 className="m-0">Jury</h3>
              <div className="flex flex-col gap-4">
                <h4 className="m-0">Types d’épreuves</h4>
                <Checkbox
                  className="m-0 [&_.fr-label]:p-2"
                  small
                  options={juryModalities.map((modality, index) => ({
                    label: modality.label,
                    nativeInputProps: {
                      ...register(`juryModalities.${index}.checked`),
                    },
                  }))}
                  state={errors.juryModalities ? "error" : "default"}
                  stateRelatedMessage={
                    errors.juryModalities
                      ? "Veuillez séléctionner au moins une option"
                      : undefined
                  }
                />

                <h4 className="m-0">Modalités de passage</h4>
                <div className="flex flex-row gap-4">
                  <Select
                    className="m-0"
                    label="Fréquence des jurys :"
                    nativeSelectProps={{
                      defaultValue: "",
                      ...register("juryFrequency"),
                    }}
                    state={errors.juryFrequency ? "error" : "default"}
                    stateRelatedMessage={errors.juryFrequency?.message}
                  >
                    <option value="" disabled>
                      Selectionnez une option
                    </option>

                    {JuryFrequencies.map((frequency) => (
                      <option key={frequency.id} value={frequency.id}>
                        {frequency.label}
                      </option>
                    ))}

                    <option key="Autre" value="Autre">
                      Autre
                    </option>
                  </Select>

                  <Input
                    className="lg:min-w-96"
                    data-test="certification-description-jury_frequency_other-input"
                    label="Autre fréquence :"
                    disabled={juryFrequency != "Autre"}
                    nativeInputProps={{
                      ...register("juryFrequencyOther"),
                    }}
                    state={errors.juryFrequencyOther ? "error" : "default"}
                    stateRelatedMessage={errors.juryFrequencyOther?.message}
                  />
                </div>
                <Input
                  className="m-0"
                  data-test="certification-description-jury_place-input"
                  label="Lieu où se déroulera le passage (optionnel) :"
                  hintText="À renseigner s’il existe peu de lieux de passage pour cette certification."
                  nativeInputProps={{
                    ...register("juryPlace"),
                  }}
                />

                <h4 className="m-0">Coûts</h4>
                <Input
                  className="mr-auto"
                  label="Estimation des frais de jury :"
                  hintText="Veuillez saisir un nombre à 2 décimales."
                  nativeInputProps={{
                    type: "number",
                    step: "0.01",
                    min: 0,
                    inputMode: "decimal",
                    ...register("juryEstimatedCost", {
                      valueAsNumber: true,
                    }),
                  }}
                  state={errors.juryEstimatedCost ? "error" : "default"}
                  stateRelatedMessage={
                    errors.juryEstimatedCost
                      ? "Veuillez renseigner une estimation"
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="m-0">
                Visibilité de la certification sur la plateforme
              </h3>
              <p className="m-0">
                Si nous avons pu récupérer l’information, les champs ci-dessous
                sont automatiquement remplis avec les dates de publication et
                d’échéance fournies par France compétences. Si vous souhaitez
                modifier ces dates et changer la visibilité de la certification
                sur la plateforme, vous le pouvez.
              </p>

              <div className="flex flex-row gap-6">
                <Input
                  label="À partir de quand sera-t-elle visible ?"
                  hintText="Les candidats pourront la voir et la choisir."
                  nativeInputProps={{
                    ...register("startOfVisibility"),
                    type: "date",
                  }}
                  state={errors.startOfVisibility ? "error" : "default"}
                  stateRelatedMessage={errors.startOfVisibility?.message}
                />

                <Input
                  label="Jusqu'à quand sera-t-elle visible ?"
                  hintText="Max. 4 à 5 mois avant le dernier jury programmé. "
                  nativeInputProps={{
                    ...register("endOfVisibility"),
                    type: "date",
                  }}
                  state={errors.endOfVisibility ? "error" : "default"}
                  stateRelatedMessage={errors.endOfVisibility?.message}
                />
              </div>
            </div>
          </div>

          <FormButtons
            backUrl={`/responsable-certifications/certifications/${certification.id}`}
            formState={{ isDirty, isSubmitting }}
          />
        </form>
      </div>
    </div>
  );
};

const Info = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <dl className={`${className || ""}`}>
    <dt className="mb-1">{title}</dt>
    <dd className="font-medium">{children}</dd>
  </dl>
);
