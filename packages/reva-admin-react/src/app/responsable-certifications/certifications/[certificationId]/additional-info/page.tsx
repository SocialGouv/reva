"use client";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";
import { useUpdateAdditionalInfoPage } from "./useCertificationAdditionalInfo.hook";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { File as GQLFile } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { graphqlErrorToast } from "@/components/toast/toast";

export default function CertificationAdditionalInfoPage() {
  const { certificationId } = useParams<{ certificationId: string }>();
  const { certification, getCertificationQueryStatus } =
    useUpdateAdditionalInfoPage({ certificationId });

  if (getCertificationQueryStatus === "pending" || !certification) {
    return null;
  }

  return (
    <div>
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

const schema = z.object({
  dossierDeValidationTemplate: z.object({
    0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
  }),
  linkToReferential: z.string({
    required_error: "Merci de remplir ce champ",
  }),
  linkToCorrespondenceTable: z.string().optional(),
  linkToJuryGuide: z.string().optional(),
  certificationExpertContactDetails: z.string().optional(),
  usefulResources: z.string().optional(),
  commentsForAAP: z.string().optional(),
});

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
      usefulResources?: string | null;
      commentsForAAP?: string | null;
      dossierDeValidationTemplate?: {
        url: string;
        name: string;
        previewUrl?: string | null;
        mimeType: string;
      };
    } | null;
  };
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      linkToReferential: certification.additionalInfo?.linkToReferential || "",
      linkToCorrespondenceTable:
        certification.additionalInfo?.linkToCorrespondenceTable || "",
      linkToJuryGuide: certification.additionalInfo?.linkToJuryGuide || "",
      certificationExpertContactDetails:
        certification.additionalInfo?.certificationExpertContactDetails || "",
      usefulResources: certification.additionalInfo?.usefulResources || "",
      commentsForAAP: certification.additionalInfo?.commentsForAAP || "",
      dossierDeValidationTemplate: undefined,
    },
  });
  const defaultDossierDeValidationTemplate = useMemo(
    () =>
      getFancyDefaultFile(
        certification.additionalInfo?.dossierDeValidationTemplate,
      ),
    [certification.additionalInfo?.dossierDeValidationTemplate],
  );

  const { updateCertificationAdditionalInfo } = useUpdateAdditionalInfoPage({
    certificationId: certification.id,
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      const dossierDeValidationTemplate =
        data.dossierDeValidationTemplate?.[0] ?? null;
      await updateCertificationAdditionalInfo({
        certificationId: certification.id,
        additionalInfo: {
          ...data,
          dossierDeValidationTemplate,
        },
      });
      router.push(
        `/responsable-certifications/certifications/${certification.id}`,
      );
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <h2>Documentation sur la certification</h2>
      <Input
        label="Lien vers les référentiels d’activités et de compétences :"
        state={errors.linkToReferential ? "error" : "default"}
        stateRelatedMessage={errors.linkToReferential?.message}
        nativeInputProps={{
          required: true,
          ...register("linkToReferential"),
        }}
      />
      <Input
        label="Lien vers le tableau des correspondances et dispenses de blocs (optionnel) :"
        state={errors.linkToCorrespondenceTable ? "error" : "default"}
        stateRelatedMessage={errors.linkToCorrespondenceTable?.message}
        nativeInputProps={{
          ...register("linkToCorrespondenceTable"),
        }}
      />

      <h2>Documentation sur le dossier de validation et le jury</h2>
      <FancyUpload
        title="Trame du dossier de validation"
        hint="Formats supportés : jpg, png, pdf avec un poids maximum de 15Mo"
        state={errors.dossierDeValidationTemplate?.[0] ? "error" : "default"}
        stateRelatedMessage={errors.dossierDeValidationTemplate?.[0]?.message}
        nativeInputProps={{
          ...register("dossierDeValidationTemplate"),
        }}
        defaultFile={defaultDossierDeValidationTemplate}
        className="mb-4"
      />
      <Input
        label="Lien vers le guide du jury (optionnel) :"
        nativeInputProps={{ ...register("linkToJuryGuide") }}
      />
      <h2>Contact d’un expert de la certification (le cas échéant)</h2>
      <Input
        label="Personne ou Service concerné (optionnel) :"
        className="max-w-sm"
        nativeInputProps={{
          ...register("certificationExpertContactDetails"),
        }}
      />
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

const getFancyDefaultFile = (file?: GQLFile) =>
  file?.previewUrl
    ? {
        name: file.name,
        mimeType: file.mimeType,
        url: file.previewUrl,
      }
    : undefined;
