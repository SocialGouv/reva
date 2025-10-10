import Alert from "@codegouvfr/react-dsfr/Alert";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { DownloadTile } from "@/components/download-tile/DownloadTile";
import { FancyPreview } from "@/components/fancy-preview/FancyPreview";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { BackButton } from "@/components/legacy/molecules/BackButton";
import {
  errorToast,
  graphqlErrorToast,
  successToast,
} from "@/components/toast/toast";
import Tooltip from "@/components/tooltip/Tooltip";

import { useFeasibilityPage } from "../feasibility.hook";

import { FeasibilityBanner } from "./FeasibilityBanner";
import { useSendFeasibilityForm } from "./SendFeasibilityForm.hooks";
import { UploadForm } from "./UploadForm";

const schema = z.object({
  certificationAuthorityId: z.string(),
  feasibilityFile: z.object({
    0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
  }),
  idFile: z.object({
    0: z.instanceof(File, { message: "Merci de remplir ce champ" }),
  }),
  documentaryProofFile: z.object({ 0: z.instanceof(File).optional() }),
  certificateOfAttendanceFile: z.object({ 0: z.instanceof(File).optional() }),
  requirements: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
});

export type FeasibilityFormData = z.infer<typeof schema>;

export const SendFeasibilityForm = (): React.ReactNode => {
  const {
    candidacyId,
    candidacy,
    queryStatus,
    updateFeasibilityFileTemplateFirstReadAt,
  } = useFeasibilityPage();

  const { sendFeasibility } = useSendFeasibilityForm(candidacyId);
  const router = useRouter();

  const feasibility = candidacy?.feasibility;

  const certificationAuthorities = candidacy?.certificationAuthorities || [];
  const canUpload =
    !candidacy?.feasibility || candidacy.feasibility.decision == "INCOMPLETE";

  const handleFeasibilityFileTemplateDownload = () =>
    updateFeasibilityFileTemplateFirstReadAt.mutateAsync({ candidacyId });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FeasibilityFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      certificationAuthorityId:
        certificationAuthorities.length == 1
          ? certificationAuthorities[0].id
          : candidacy?.feasibility?.certificationAuthority?.id || "",
      feasibilityFile: {},
      idFile: {},
      documentaryProofFile: {},
      certificateOfAttendanceFile: {},
      requirements: [
        {
          id: "0",
          label: "Mon dossier de faisabilité est correct, complet et signé.",
          checked: false,
        },
        {
          id: "1",
          label:
            "Ma pièce d’identité est conforme, en cours de validité et lisible.",
          checked: false,
        },
      ],
    },
  });

  const certificationAuthorityId = watch("certificationAuthorityId");

  const { fields: requirements } = useFieldArray({
    control,
    name: "requirements",
  });

  const requirementsFields = watch("requirements");
  const areRequirementsChecked = requirementsFields.every(
    (requirement) => requirement.checked,
  );

  const CertificationContactCard = useMemo(() => {
    if (!certificationAuthorityId) {
      return null;
    }
    const selectedCertificationAuthority =
      candidacy?.certificationAuthorities.find(
        (c) => c.id === certificationAuthorityId,
      );

    return (
      <CallOut
        title={
          <>
            <h4 className="inline-block">
              Comment contacter mon certificateur ?
            </h4>
            <Tooltip tooltipText="Il vous informe sur les frais liés à votre parcours VAE, étudie votre dossier de faisabilité, prononce votre recevabilité et organise les jurys.">
              <span
                className="fr-icon-question-line text-dsfrBlue-500"
                aria-hidden="true"
              />
            </Tooltip>
          </>
        }
        className="w-full md:w-3/5"
      >
        {selectedCertificationAuthority?.label}
        <br />
        {selectedCertificationAuthority?.contactFullName}
        <br />
        {selectedCertificationAuthority?.contactEmail}
      </CallOut>
    );
  }, [candidacy?.certificationAuthorities, certificationAuthorityId]);

  if (queryStatus === "error") {
    return (
      <Alert
        severity="error"
        title="Une erreur est survenue."
        description="Impossible de charger la candidature. Veuillez réessayer."
        closable={false}
      />
    );
  }
  if (!candidacy) {
    return (
      <Alert
        severity="error"
        title="La candidature n'a pas été trouvée."
        closable={false}
      />
    );
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!candidacyId) {
      return;
    }

    try {
      const response = await sendFeasibility.mutateAsync({
        candidacyId,
        certificationAuthorityId: data.certificationAuthorityId,
        feasibilityFile: data.feasibilityFile[0],
        IDFile: data.idFile[0],
        documentaryProofFile: data.documentaryProofFile?.[0],
        certificateOfAttendanceFile: data.certificateOfAttendanceFile?.[0],
      });

      const textError = await response.text();
      if (textError) {
        if (response.status == 413) {
          errorToast(
            "Le fichier que vous tentez d'envoyer est trop volumineux. Veuillez soumettre un fichier d'une taille égale ou inférieure à 20 Mo.",
          );
        } else {
          errorToast(textError);
        }
      } else {
        successToast("Dossier de faisabilité envoyé");
        router.push("../");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  return (
    <div className="mt-12">
      <FeasibilityBanner feasibility={feasibility} />
      <form
        onSubmit={handleFormSubmit}
        onReset={(e) => {
          e.preventDefault();
          reset();
        }}
        className="flex flex-col gap-6"
      >
        {certificationAuthorities.length > 1 && canUpload && (
          <>
            <Select
              className="w-3/5 mb-0"
              label={
                <label className="block mt-[6px] mb-[10px]">
                  Sélectionnez la structure certificatrice :
                </label>
              }
              nativeSelectProps={{
                ...register("certificationAuthorityId"),
                required: true,
              }}
            >
              <>
                <option disabled hidden value="">
                  Sélectionner
                </option>
                {certificationAuthorities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </>
            </Select>
          </>
        )}
        {CertificationContactCard}
        {certificationAuthorities.length === 0 && (
          <Alert
            severity="warning"
            title="Il n’y aucun certificateur rattaché à ce diplôme pour le moment"
            description="Pour en savoir plus, contactez le support à support@vae.gouv.fr."
            className="w-3/5"
          />
        )}
        <DownloadTile
          name="Trame du dossier de faisabilité"
          description="Pour compléter votre dossier, vous devez télécharger cette trame de dossier de faisabilité, le compléter, le signer et le joindre avec toutes les pièces justificatives nécessaires."
          url="/candidat/files/Dossier_faisabilité_candidat_autonome.pdf"
          mimeType="application/pdf"
          fileSizeInBytes={2407563}
          onUrlClick={handleFeasibilityFileTemplateDownload}
        />
        <hr className="pb-1" />
        {canUpload && (
          <>
            <UploadForm
              errors={errors}
              register={register}
              requirements={requirements}
            />
            <FormButtons
              formState={{
                isDirty: isDirty,
                isSubmitting: isSubmitting,
                canSubmit:
                  certificationAuthorities.length > 0 && areRequirementsChecked,
              }}
              backUrl="/"
              submitButtonLabel="Envoyer"
            />
          </>
        )}

        {!canUpload && feasibility?.feasibilityUploadedPdf && (
          <>
            <div>
              {feasibility?.feasibilityUploadedPdf?.feasibilityFile
                .previewUrl && (
                <FancyPreview
                  defaultDisplay={false}
                  name="Dossier de faisabilité"
                  title={
                    feasibility?.feasibilityUploadedPdf?.feasibilityFile.name
                  }
                  src={
                    feasibility?.feasibilityUploadedPdf?.feasibilityFile
                      .previewUrl
                  }
                />
              )}
              {feasibility?.feasibilityUploadedPdf?.IDFile?.previewUrl && (
                <FancyPreview
                  defaultDisplay={false}
                  name="Pièce d'identité"
                  title={feasibility?.feasibilityUploadedPdf?.IDFile.name}
                  src={feasibility?.feasibilityUploadedPdf?.IDFile.previewUrl}
                />
              )}
              {feasibility?.feasibilityUploadedPdf?.documentaryProofFile
                ?.previewUrl && (
                <FancyPreview
                  defaultDisplay={false}
                  name="Justificatif équivalence"
                  title={
                    feasibility?.feasibilityUploadedPdf?.documentaryProofFile
                      .name
                  }
                  src={
                    feasibility?.feasibilityUploadedPdf?.documentaryProofFile
                      .previewUrl
                  }
                />
              )}
              {feasibility?.feasibilityUploadedPdf?.certificateOfAttendanceFile
                ?.previewUrl && (
                <FancyPreview
                  defaultDisplay={false}
                  name="Attestation ou certificat de formation"
                  title={
                    feasibility?.feasibilityUploadedPdf
                      ?.certificateOfAttendanceFile.name
                  }
                  src={
                    feasibility?.feasibilityUploadedPdf
                      ?.certificateOfAttendanceFile.previewUrl
                  }
                />
              )}
            </div>
            <BackButton label="Retour" />
          </>
        )}
      </form>
    </div>
  );
};
