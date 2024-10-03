import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { type FeasibilityFormData } from "./SendFeasibilityForm.component";
import { useForm } from "react-hook-form";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

type UploadFormType = ReturnType<typeof useForm<FeasibilityFormData>>;
type UploadFormProps = {
  errors: UploadFormType["formState"]["errors"];
  register: UploadFormType["register"];
  requirements: FeasibilityFormData["requirements"];
};

export const UploadForm = ({
  errors,
  register,
  requirements,
}: UploadFormProps) => {
  return (
    <>
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
      <hr className="pb-1 mt-1" />
      <fieldset>
        <Checkbox
          small
          legend="Avez-vous bien vérifié ces éléments avant l’envoi ? "
          className="mb-0"
          options={requirements.map((option, optionId) => ({
            label: option.label,
            nativeInputProps: {
              required: true,
              ...register(`requirements.${optionId}.checked`),
            },
          }))}
        />
      </fieldset>
    </>
  );
};