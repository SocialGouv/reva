import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { useForm } from "react-hook-form";

import { FancyUpload } from "@/components/fancy-upload/FancyUpload";

import { type FeasibilityFormData } from "./SendFeasibilityForm.component";

type UploadFormType = ReturnType<typeof useForm<FeasibilityFormData>>;
type UploadFormProps = {
  errors: UploadFormType["formState"]["errors"];
  register: UploadFormType["register"];
  requirements: FeasibilityFormData["requirements"];
  disabled?: boolean;
};

export const UploadForm = ({
  errors,
  register,
  requirements,
  disabled,
}: UploadFormProps) => {
  return (
    <div className="flex flex-col gap-4" data-testid="feasibility-upload-form">
      <FancyUpload
        title="Joindre le dossier de faisabilité"
        description="Vous devez le remplir avec attention et le signer. Pensez à vérifier que vous avez tout saisi avant l’envoi au certificateur."
        hint="Format supporté : PDF uniquement avec un poids maximum de 20 Mo"
        nativeInputProps={{
          ...register("feasibilityFile"),
          accept: ".pdf",
          disabled,
        }}
        state={errors.feasibilityFile ? "error" : "default"}
        stateRelatedMessage={errors.feasibilityFile?.[0]?.message}
      />
      <FancyUpload
        title="Joindre la pièce d’identité (carte identité, passeport, carte de séjour)"
        description="Copie ou scan lisible (la photo ne doit pas être floue) et en cours de validité. Cette pièce permet de valider votre inscription au parcours VAE et de justifier votre identité lors du passage devant le jury."
        hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
        nativeInputProps={{
          ...register("idFile"),
          disabled,
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
          disabled,
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
          disabled,
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
              disabled,
            },
          }))}
        />
      </fieldset>
    </div>
  );
};
