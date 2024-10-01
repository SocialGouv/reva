import { errorToast, graphqlErrorToast, successToast } from "@/components/toast/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Select from "@codegouvfr/react-dsfr/Select";
import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { useSendFeasibilityForm } from "./SendFeasibilityForm.hooks";
import { GraphQLError } from "graphql";
import { useFeasibilityPage } from "../feasibility.hook";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { FeasibilityHistory } from "@/graphql/generated/graphql";
import { FeasibilityDecisionHistory } from "@/components/feasibility-decision-history";
import { DownloadTile } from "@/components/download-tile/DownloadTile";

const schema = z.object({
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

type FeasibilityFormData = z.infer<typeof schema>;

export const SendFeasibilityForm = (): React.ReactNode => {
  const { candidacy, queryStatus } = useFeasibilityPage();
  const candidacyId = candidacy?.id;
  const { sendFeasibility } = useSendFeasibilityForm(candidacyId);
  const router = useRouter();

  const feasibility = candidacy.feasibility;

  const certificationAuthorities = useMemo(
    () => candidacy.certificationAuthorities || [],
    [candidacy.certificationAuthorities],
  );

  const [certificationAuthorityId, setCertificationAuthorityId] = useState<
    string | undefined
  >(candidacy.feasibility?.certificationAuthority?.id);

  const certificationAuthority = certificationAuthorities.find(
    (c) => c.id == certificationAuthorityId,
  );

  useEffect(() => {
    if (certificationAuthorities.length == 1) {
      setCertificationAuthorityId(certificationAuthorities[0].id);
    }
  }, [certificationAuthorities]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FeasibilityFormData>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      requirements: [
        {
          id: "0",
          label:
            "J'ai bien vérifié que le dossier de faisabilité était correct, complet et signé par moi-même ainsi que par le candidat.",
          checked: false,
        },
        {
          id: "1",
          label:
            "J'ai bien vérifié que la pièce d’identité était conforme, en cours de validité et lisible.",
          checked: false,
        },
      ],
    },
  });

  const { fields: requirements } = useFieldArray({
    control,
    name: "requirements",
  });

  const CertificationContactCard = useMemo(() => {
    if (!certificationAuthorityId) {
      return null;
    }
    const selectedCertificationAuthority =
      candidacy?.certificationAuthorities.find(
        (c) => c.id === certificationAuthorityId,
      );
    return (
      <CallOut title="Comment contacter mon certificateur ?" className="w-3/5">
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
    if (!candidacyId || !certificationAuthority) {
      return;
    }

    try {
      const response = await sendFeasibility.mutateAsync({
        candidacyId,
        certificationAuthorityId: certificationAuthority.id,
        feasibilityFile: data.feasibilityFile[0],
        IDFile: data.idFile[0],
        documentaryProofFile: data.documentaryProofFile?.[0],
        certificateOfAttendanceFile: data.certificateOfAttendanceFile?.[0],
      });

      const textError = await response.text();
      if (textError) {
        if (response.status == 413) {
          errorToast(
            "Le fichier que vous tentez d'envoyer est trop volumineux. Veuillez soumettre un fichier d'une taille inférieure à 20 Mo.",
          );
        } else {
          errorToast(textError);
        }
      } else {
        successToast("Dossier de faisabilité envoyé");
        router.push('/');
      }
    } catch (error) {
      graphqlErrorToast(error as GraphQLError);
    }
  });

  let feasibilityHistory: FeasibilityHistory[] = feasibility?.history || [];
  if (feasibility?.decision == "INCOMPLETE") {
    feasibilityHistory = [
      {
        id: feasibility.id,
        decision: feasibility.decision,
        decisionComment: feasibility.decisionComment,
        decisionSentAt: feasibility.decisionSentAt,
      },
      ...feasibilityHistory,
    ];
  }

  if (!certificationAuthorities.length) {
    return (
      <Alert
        className="mt-4"
        small
        severity="warning"
        title="Attention"
        description="Aucun certificateur n'est actuellement rattaché à cette certification
          pour le département de la candidature. Il n'est donc pas actuellement
          possible de remplir le dossier de faisabilité."
      />
    );
  }

  return (
    <>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        {certificationAuthorities.length > 1 && (
          <Select
            label={
              <label className="block mt-[6px] mb-[10px] text-xs font-semibold">
                SÉLECTIONNEZ L&apos;AUTORITÉ DE CERTIFICATION
              </label>
            }
            nativeSelectProps={{
              onChange: (event) =>
                setCertificationAuthorityId(event.target.value),
              value: certificationAuthorityId || "",
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
        )}
        {CertificationContactCard}

        <DownloadTile
          name="Trame du dossier de faisabilité"
          description="Pour compléter votre dossier, vous devez télécharger cette trame de dossier de faisabilité, le compléter, le signer et le joindre avec toutes les pièces justificatives nécessaires."
          url="/files/Dossier_faisabilité_candidat_autonome.pdf"
          mimeType="application/pdf"
        />
        <hr className="pb-1" />
        <FancyUpload
          title="Joindre le dossier de faisabilité"
          description="Le dossier doit être complet et signé par vous-même et le candidat. Pensez à vérifier que vous avez tout saisi avant l’envoi."
          hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
          nativeInputProps={{
            ...register("feasibilityFile"),
            accept: ".pdf",
          }}
          state={errors.feasibilityFile ? "error" : "default"}
          stateRelatedMessage={errors.feasibilityFile?.[0]?.message}
        />
        <FancyUpload
          title="Joindre la pièce d’identité (carte identité, passeport, carte de séjour)"
          description="Copie ou scan lisible (la photo ne doit pas être floue) et en cours de validité. Cette pièce sera demandée au candidat pour justifier de son identité lors du passage devant jury et la délivrance éventuelle du diplôme."
          hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
          nativeInputProps={{
            ...register("idFile"),
          }}
          state={errors.idFile ? "error" : "default"}
          stateRelatedMessage={errors.idFile?.[0]?.message}
        />
        <FancyUpload
          title="Joindre une autre pièce (optionnel)"
          description="Copie du ou des justificatif(s) ouvrant accès à une équivalence ou dispense en lien avec la certification visée."
          hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
          nativeInputProps={{
            ...register("documentaryProofFile"),
            accept: ".pdf",
          }}
          state={errors.documentaryProofFile ? "error" : "default"}
          stateRelatedMessage={errors.documentaryProofFile?.[0]?.message}
        />
        <FancyUpload
          title="Joindre une autre pièce (optionnel)"
          description="Attestation ou certificat de suivi de formation dans le cas du prérequis demandé par la certification visée."
          hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
          nativeInputProps={{
            ...register("certificateOfAttendanceFile"),
            accept: ".pdf",
          }}
          state={errors.certificateOfAttendanceFile ? "error" : "default"}
          stateRelatedMessage={errors.certificateOfAttendanceFile?.[0]?.message}
        />

        {/* {certificationAuthority && (
          <CertificationAuthorityLocalAccounts
            certificationAuthorityId={certificationAuthority.id}
            certificationId={
              candidacy.data?.getCandidacyById?.certification?.id
            }
            departmentId={candidacy.data?.getCandidacyById?.department?.id}
          />
        )} */}

        {feasibilityHistory.length > 0 && (
          <FeasibilityDecisionHistory history={feasibilityHistory} />
        )}

        <fieldset>
          <h4>Avant de finaliser votre envoi</h4>
          <GrayCard>
            <Checkbox
              className="mb-0"
              options={requirements.map((option, optionId) => ({
                label: option.label,
                nativeInputProps: {
                  required: true,
                  ...register(`requirements.${optionId}.checked`),
                },
              }))}
            />
          </GrayCard>
        </fieldset>

        <div className="flex flex-row justify-end">
          <Button
            priority="primary"
            type="submit"
            disabled={sendFeasibility.isPending}
          >
            Valider
          </Button>
        </div>
      </form>
    </>
  );
};
