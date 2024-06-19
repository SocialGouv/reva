import { errorToast, graphqlErrorToast } from "@/components/toast/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Notice from "@codegouvfr/react-dsfr/Notice";
import Button from "@codegouvfr/react-dsfr/Button";
import Alert from "@codegouvfr/react-dsfr/Alert";

import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FeasibilityDecisionHistory } from "@/components/feasibility-decison-history";

import { useHooks } from "./SendFeasibilityForm.hooks";

const schema = z.object({
  feasibilityFile: z.object({ 0: z.instanceof(File) }),
  idFile: z.object({ 0: z.instanceof(File) }),
  documentaryProofFile: z.object({ 0: z.instanceof(File).optional() }),
  certificateOfAttendanceFile: z.object({ 0: z.instanceof(File).optional() }),
  requirements: z
    .object({ id: z.string(), label: z.string(), checked: z.boolean() })
    .array(),
});

type FeasibilityFormData = z.infer<typeof schema>;

interface Props {
  candidacyId: string;
}

export const SendFeasibilityForm = (props: Props): JSX.Element => {
  const { candidacyId } = props;

  const { candidacy, sendFeasibility } = useHooks(candidacyId);

  const certificationAuthority =
    candidacy.data?.getCandidacyById?.certificationAuthorities?.[0];
  const feasibility = candidacy.data?.getCandidacyById?.feasibility;

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
            "Le fichier que vous tentez d'envoyer est trop volumineux. Veuillez soumettre un fichier d'une taille inférieur à 20 Mo.",
          );
        } else {
          errorToast(textError);
        }
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  });

  return (
    <>
      <h5 className="mb-0">Pièces jointes</h5>
      <Alert
        severity="info"
        small
        description={
          <p>
            Si vous ne joignez pas la bonne pièce, cliquez à nouveau sur le
            bouton <strong className="italic">“Parcourir”</strong> pour la
            remplacer par la pièce valide.
          </p>
        }
      />

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
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
          hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
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
          description="Attestation ou certificat de suivi de formation dans le cas du pré-requis demandé par la certification visée."
          hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
          nativeInputProps={{
            ...register("certificateOfAttendanceFile"),
            accept: ".pdf",
          }}
          state={errors.certificateOfAttendanceFile ? "error" : "default"}
          stateRelatedMessage={errors.certificateOfAttendanceFile?.[0]?.message}
        />

        {certificationAuthority && (
          <fieldset>
            <h4>Autorité de certification</h4>
            <GrayCard className="gap-4">
              <h6 className="mb-0">{certificationAuthority.label}</h6>
              <p className="mb-0">{certificationAuthority.contactFullName}</p>
              <p className="mb-0">{certificationAuthority.contactEmail}</p>
            </GrayCard>
          </fieldset>
        )}

        {feasibility?.history && feasibility.history.length > 0 && (
          <FeasibilityDecisionHistory history={feasibility?.history} />
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

        <Notice
          title={
            <>
              Pour retrouver les dossiers de faisabilité et être guidé dans le
              remplissage,{" "}
              <a
                href="https://fabnummas.notion.site/Dossiers-de-faisabilit-c5bff6e7fa7744859cda85c935fd928f"
                target="_blank"
              >
                consultez la documentation
              </a>{" "}
              ou{" "}
              <a
                href="https://www.notion.so/fabnummas/NOTICE-D-UTILISATION-DU-DOSSIER-DE-FAISABILITE-92a8744b294a47259396fe1efd226043"
                target="_blank"
              >
                la notice d’utilisation du dossier de faisabilité
              </a>
            </>
          }
        />

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
