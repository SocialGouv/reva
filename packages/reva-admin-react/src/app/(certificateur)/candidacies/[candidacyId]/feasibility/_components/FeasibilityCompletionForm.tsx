import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { sanitizedOptionalText } from "@/utils/input-sanitization";

const schema = z
  .object({
    decision: z.enum(["COMPLETE", "INCOMPLETE"], {
      errorMap: () => {
        return { message: "Merci de remplir ce champ" };
      },
    }),
    comment: sanitizedOptionalText(),
  })
  .superRefine(({ decision, comment }, { addIssue }) => {
    if (decision === "INCOMPLETE" && !comment) {
      addIssue({
        path: ["comment"],
        code: "too_small",
        minimum: 1,
        type: "string",
        inclusive: true,
        message: "Merci de remplir ce champ",
      });
    }
  });

export type FeasibilityCompletionFormData = z.infer<typeof schema>;

export const FeasibilityCompletionForm = ({
  onSubmit,
  className,
}: {
  onSubmit?(data: FeasibilityCompletionFormData): void;
  className?: string;
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FeasibilityCompletionFormData>({ resolver: zodResolver(schema) });

  const handleFormSubmit = handleSubmit((data) => onSubmit?.(data));

  const { decision } = useWatch({ control });

  return (
    <form className={`flex flex-col ${className}`} onSubmit={handleFormSubmit}>
      <fieldset>
        <legend>
          <h2>État du dossier de faisabilité</h2>
        </legend>
        <p>
          Après étude du dossier, sélectionnez son état et partagez des
          observations utiles au candidat ou à l’AAP.
        </p>
        <RadioButtons
          legend="Quel est l’état de ce dossier de faisabilité ? "
          options={[
            {
              label: <p className="mb-0 text-base">Ce dossier est complet</p>,
              hintText:
                "Il est correctement rempli et toutes les pièces nécessaires ont été transmises. En cas de dossier complet, et sous condition de recevabilité, le candidat pourra poursuivre son parcours VAE.",
              nativeInputProps: {
                ...register("decision"),
                value: "COMPLETE",
              },
            },
            {
              label: <p className="mb-0 text-base">Ce dossier est incomplet</p>,
              hintText:
                "Est considéré comme incomplet tout dossier auquel manque des éléments nécessaires à son traitement (pièces jointes inexploitables ou erronées, informations manquantes, mauvais dossier...). L’AAP aura accès à la modification du dossier du candidat pour apporter les informations complémentaires demandées.",
              nativeInputProps: {
                ...register("decision"),
                value: "INCOMPLETE",
              },
            },
          ]}
          state={errors.decision ? "error" : "default"}
          stateRelatedMessage={errors.decision?.message}
        />
        <Input
          classes={{ nativeInputOrTextArea: "!min-h-[100px]" }}
          className="w-full"
          textArea
          disabled={decision === "COMPLETE"}
          label={
            <span className="text-base">
              Pouvez-vous indiquer les éléments à revoir dans le dossier ?
            </span>
          }
          nativeTextAreaProps={register("comment")}
          state={errors.comment ? "error" : "default"}
          stateRelatedMessage={errors.comment?.message}
        />
      </fieldset>
      <br />
      <FormButtons
        backUrl="/candidacies/feasibilities"
        formState={{ isSubmitting, isDirty }}
      />
    </form>
  );
};
