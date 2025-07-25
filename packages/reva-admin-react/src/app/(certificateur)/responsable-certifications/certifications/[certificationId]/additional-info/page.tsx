"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { File as GQLFile } from "@/graphql/generated/graphql";

import { useUpdateAdditionalInfoPage } from "./useCertificationAdditionalInfo.hook";

export default function CertificationAdditionalInfoPage() {
  const { certificationId } = useParams<{ certificationId: string }>();
  const { certification, getCertificationQueryStatus } =
    useUpdateAdditionalInfoPage({ certificationId });

  if (getCertificationQueryStatus === "pending" || !certification) {
    return null;
  }

  return (
    <div data-test="update-certification-additional-info-page">
      <Breadcrumb
        currentPageLabel="Ressources complémetaires"
        segments={[
          {
            label: `RNCP${certification.codeRncp} - ${certification.label}`,
            linkProps: {
              href: `/responsable-certifications/certifications/${certification.id}`,
            },
          },
        ]}
      />
      <h1>Ressources complémentaires</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl">
        La transmission de ces ressources aux AAP et aux candidats vous
        permettra de recevoir des dossiers de validation bien remplis et
        complets.
      </p>
      <AdditionalInfoForm certification={certification} />
    </div>
  );
}

const schema = z
  .object({
    dossierDeValidationTemplate: z
      .object({
        0: z
          .instanceof(File, { message: "Merci de remplir ce champ" })
          .optional(),
      })
      .optional(),
    additionalDocuments: z
      .object({
        0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
      })
      .array(),
    dossierDeValidationLink: z.string().optional(),
    linkToReferential: z.string().min(1, "Merci de remplir ce champ"),
    linkToCorrespondenceTable: z.string().optional(),
    linkToJuryGuide: z.string().optional(),
    certificationExpertContactDetails: z.string().optional(),
    certificationExpertContactPhone: z.string().optional(),
    certificationExpertContactEmail: z.string().optional(),
    usefulResources: z.string().optional(),
    commentsForAAP: z.string().optional(),
  })
  .superRefine(
    (
      { dossierDeValidationTemplate, dossierDeValidationLink },
      { addIssue },
    ) => {
      if (!dossierDeValidationTemplate?.[0] && !dossierDeValidationLink) {
        addIssue({
          path: ["dossierDeValidationTemplate[0]"],
          message: "Vous devez renseigner au moins un de ces deux champs",
          code: z.ZodIssueCode.custom,
        });

        addIssue({
          path: ["dossierDeValidationLink"],
          message: "Vous devez renseigner au moins un de ces deux champs",
          code: z.ZodIssueCode.custom,
        });
      }
    },
  );

type FormData = z.infer<typeof schema>;

const AdditionalInfoForm = ({
  certification,
}: {
  certification: {
    id: string;
    additionalInfo?: {
      linkToReferential: string;
      linkToCorrespondenceTable?: string | null;
      linkToJuryGuide?: string | null;
      certificationExpertContactDetails?: string | null;
      certificationExpertContactPhone?: string | null;
      certificationExpertContactEmail?: string | null;
      usefulResources?: string | null;
      commentsForAAP?: string | null;
      dossierDeValidationTemplate?: {
        url: string;
        name: string;
        previewUrl?: string | null;
        mimeType: string;
      } | null;
      additionalDocuments?: {
        url: string;
        name: string;
        previewUrl?: string | null;
        mimeType: string;
      }[];
      dossierDeValidationLink?: string | null;
    } | null;
  };
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      linkToReferential: certification.additionalInfo?.linkToReferential || "",
      linkToCorrespondenceTable:
        certification.additionalInfo?.linkToCorrespondenceTable || "",
      linkToJuryGuide: certification.additionalInfo?.linkToJuryGuide || "",
      certificationExpertContactDetails:
        certification.additionalInfo?.certificationExpertContactDetails || "",
      certificationExpertContactPhone:
        certification.additionalInfo?.certificationExpertContactPhone || "",
      certificationExpertContactEmail:
        certification.additionalInfo?.certificationExpertContactEmail || "",
      usefulResources: certification.additionalInfo?.usefulResources || "",
      commentsForAAP: certification.additionalInfo?.commentsForAAP || "",
      dossierDeValidationTemplate: undefined,
      dossierDeValidationLink:
        certification.additionalInfo?.dossierDeValidationLink || "",
      additionalDocuments:
        certification.additionalInfo?.additionalDocuments?.map((doc) => ({
          0: { name: doc.name } as File,
        })) || [],
    },
  });
  const defaultDossierDeValidationTemplate = useMemo(
    () =>
      getFancyDefaultFile(
        certification.additionalInfo?.dossierDeValidationTemplate,
      ),
    [certification.additionalInfo?.dossierDeValidationTemplate],
  );

  const {
    fields: additionalDocumentsFields,
    append: appendAdditionalDocument,
    remove: removeAdditionalDocument,
  } = useFieldArray<FormData>({
    control,
    name: "additionalDocuments",
  });

  const defaultAdditionalDocuments = useMemo(() => {
    // map defaultFile for the FancyUpload component
    // look for the file name of the FancyUpload and find a match in the certification additionalDocuments
    // if found, return the file
    return additionalDocumentsFields?.map((file) =>
      getFancyDefaultFile(
        certification?.additionalInfo?.additionalDocuments?.find(
          (doc) => doc.name === file[0]?.name,
        ),
      ),
    );
  }, [
    additionalDocumentsFields,
    certification.additionalInfo?.additionalDocuments,
  ]);

  const { updateCertificationAdditionalInfo } = useUpdateAdditionalInfoPage({
    certificationId: certification.id,
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      const dossierDeValidationTemplate =
        data.dossierDeValidationTemplate?.[0] ?? null;
      const additionalDocuments = data.additionalDocuments.map((d) => d?.[0]);
      await updateCertificationAdditionalInfo.mutateAsync({
        certificationId: certification.id,
        additionalInfo: {
          ...data,
          dossierDeValidationTemplate,
          additionalDocuments,
        },
      });
      successToast("Modification enregistrée");
      router.push(
        `/responsable-certifications/certifications/${certification.id}`,
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const [watchedDossierDeValidationTemplate, watchedDossierDeValidationLink] =
    watch(["dossierDeValidationTemplate", "dossierDeValidationLink"]);

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} onReset={handleReset}>
      <h2>Documentation sur la certification</h2>
      <Input
        data-test="referential-link-input"
        label="Lien vers les référentiels d’activités et de compétences :"
        state={errors.linkToReferential ? "error" : "default"}
        stateRelatedMessage={errors.linkToReferential?.message}
        nativeInputProps={{
          placeholder: "https://",
          ...register("linkToReferential"),
        }}
      />
      <Input
        label="Lien vers le référentiel d'évaluation (optionnel) :"
        nativeInputProps={{
          placeholder: "https://",
          ...register("linkToJuryGuide"),
        }}
      />
      <Input
        label="Lien vers le tableau des correspondances et dispenses de blocs (optionnel) :"
        state={errors.linkToCorrespondenceTable ? "error" : "default"}
        stateRelatedMessage={errors.linkToCorrespondenceTable?.message}
        nativeInputProps={{
          placeholder: "https://",
          ...register("linkToCorrespondenceTable"),
        }}
      />

      <h2>Documentation sur le dossier de validation</h2>
      <p className="text-xl">
        Veuillez importer un fichier ou renseigner un lien vers la trame du
        dossier de validation.
      </p>
      <FancyUpload
        dataTest="dossier-de-validation-template-upload"
        title="Importer un fichier de trame de dossier"
        hint="Formats supportés : jpg, png, pdf avec un poids maximum de 15Mo"
        state={errors.dossierDeValidationTemplate?.[0] ? "error" : "default"}
        stateRelatedMessage={errors.dossierDeValidationTemplate?.[0]?.message}
        nativeInputProps={{
          disabled: !!watchedDossierDeValidationLink,
          ...register("dossierDeValidationTemplate"),
        }}
        defaultFile={defaultDossierDeValidationTemplate}
        className="mb-4"
      />
      <div className="flex flex-col gap-4 px-8 mb-10">
        <label className="font-bold text-lg">
          Ou renseigner le lien vers la trame du dossier
        </label>
        <Input
          data-test="dossier-de-validation-link"
          label="Lien de la trame :"
          className="flex-1"
          disabled={!!watchedDossierDeValidationTemplate?.[0]}
          state={errors.dossierDeValidationLink ? "error" : "default"}
          stateRelatedMessage={errors.dossierDeValidationLink?.message}
          nativeInputProps={{
            placeholder: "https://",
            ...register("dossierDeValidationLink"),
          }}
        />
      </div>

      <h2>Contact d’un expert de la certification (le cas échéant)</h2>
      <Input
        label="Personne ou Service concerné (optionnel) :"
        className="flex-1"
        nativeInputProps={{
          ...register("certificationExpertContactDetails"),
        }}
      />
      <div className="flex flex-col gap-0 lg:flex-row lg:gap-6">
        <Input
          label="Téléphone (optionnel) :"
          className="flex-1 lg:max-w-sm"
          nativeInputProps={{
            ...register("certificationExpertContactPhone"),
          }}
        />
        <Input
          label="E-mail (optionnel) :"
          className="flex-1 mb-6"
          nativeInputProps={{
            ...register("certificationExpertContactEmail"),
          }}
        />
      </div>
      <h2>Documentation libre</h2>
      <p>
        Vous pouvez ajouter ici tous les documents complémentaires que vous
        jugez utiles pour accompagner les candidats et les AAP dans leur
        parcours VAE.
      </p>
      <div className="flex flex-col gap-4">
        {additionalDocumentsFields.map((field, index) => (
          <FancyUpload
            key={field.id}
            dataTest="additional-document-upload"
            title="Importer un fichier"
            description="Exemples de documents utiles : référentiels d'activités et de compétences, guides pratiques, grilles d'évaluation, exemples de dossiers, fiches méthodologiques, etc."
            hint="Formats supportés : jpg, png, pdf avec un poids maximum de 15Mo"
            state={errors.additionalDocuments?.[index] ? "error" : "default"}
            stateRelatedMessage={
              errors.additionalDocuments?.[index]?.[0]?.message
            }
            nativeInputProps={{
              ...register(`additionalDocuments.${index}`),
            }}
            onClickDelete={() => removeAdditionalDocument(index)}
            defaultFile={defaultAdditionalDocuments?.[index]}
          />
        ))}
      </div>
      <hr />
      <Button
        className="mb-4"
        priority="tertiary no outline"
        type="button"
        iconId="fr-icon-add-line"
        onClick={() => appendAdditionalDocument({ 0: {} as File })}
      >
        Ajouter une pièce jointe
      </Button>
      <h2>Informations facultatives</h2>
      <Input
        label="Ressources pour aider au parcours VAE (optionnel) :"
        textArea
        nativeTextAreaProps={{ ...register("usefulResources") }}
      />
      <Input
        label="Remarques à transmettre à l’AAP (optionnel) :"
        textArea
        nativeTextAreaProps={{ ...register("commentsForAAP") }}
      />
      <FormButtons
        backUrl={`/responsable-certifications/certifications/${certification.id}`}
        formState={{ isDirty, isSubmitting }}
      />
    </form>
  );
};

const getFancyDefaultFile = (file?: GQLFile | null) =>
  file?.previewUrl
    ? {
        name: file.name,
        mimeType: file.mimeType,
        url: file.previewUrl,
      }
    : undefined;
