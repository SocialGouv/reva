import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";

const schema = z
  .object({
    decision: z.enum(["ADMISSIBLE", "REJECTED", "INCOMPLETE"], {
      errorMap: () => {
        return { message: "Merci de remplir ce champ" };
      },
    }),
    comment: z.string(),
    infoFile: z.object({ 0: z.instanceof(File).optional() }),
  })
  .superRefine(({ decision, comment }, { addIssue }) => {
    if (decision !== "ADMISSIBLE" && !comment) {
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

export type FeasibilityFormData = z.infer<typeof schema>;

export const FeasibilityForm = ({
  onSubmit,
  className,
}: {
  onSubmit?(data: FeasibilityFormData): void;
  className?: string;
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FeasibilityFormData>({ resolver: zodResolver(schema) });

  const handleFormSubmit = handleSubmit((data) => onSubmit?.(data));

  const { decision } = useWatch({ control });

  return (
    <form className={`flex flex-col ${className}`} onSubmit={handleFormSubmit}>
      <fieldset>
        <legend>
          <h2>Décision concernant ce dossier</h2>
          <FormOptionalFieldsDisclaimer />
        </legend>
        <RadioButtons
          legend="Sélectionnez si ce dossier est recevable, incomplet/incorrect ou non recevable."
          options={[
            {
              label: <p className="mb-0 text-base">Ce dossier est recevable</p>,
              nativeInputProps: {
                ...register("decision"),
                value: "ADMISSIBLE",
              },
            },
            {
              label: (
                <p className="mb-0 text-base">
                  Ce dossier est incomplet ou incorrect
                </p>
              ),
              hintText:
                "Est considéré comme incomplet ou incorrect tout dossier auquel manque des éléments nécessaires à son traitement (pièces jointes inexploitables ou erronnées, informations manquantes, mauvais dossier...). Le candidat aura accès à la modification de son dossier pour apporter les informations complémentaires demandées.",
              nativeInputProps: {
                ...register("decision"),
                value: "INCOMPLETE",
              },
            },
            {
              label: (
                <p className="mb-0 text-base">Ce dossier est non recevable</p>
              ),
              hintText:
                "Est considéré comme non recevable un dossier complet affichant des expériences qui ne correspondent pas au référentiel de la certification (ou bloc) visée. Si le dossier n’est pas recevable, le candidat ne pourra plus demander de recevabilité sur cette certification durant l’année civile en cours.",
              nativeInputProps: { ...register("decision"), value: "REJECTED" },
            },
          ]}
          state={errors.decision ? "error" : "default"}
          stateRelatedMessage={errors.decision?.message}
        />
        <Input
          classes={{ nativeInputOrTextArea: "!min-h-[100px]" }}
          className="w-full"
          textArea
          label={
            <span className="text-base">
              Pouvez-vous préciser les motifs de cette décision ?{" "}
              {decision === "ADMISSIBLE" ? "(Optionnel)" : ""}
            </span>
          }
          hintText="Ces motifs seront transmis au candidat et à l'AAP le cas échéant."
          nativeTextAreaProps={register("comment")}
          state={errors.comment ? "error" : "default"}
          stateRelatedMessage={errors.comment?.message}
        />
        <FancyUpload
          title="Joindre le courrier de recevabilité (Optionnel)"
          description="Ce courrier sera joint au message envoyé au candidat."
          hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
          nativeInputProps={register("infoFile")}
        />
      </fieldset>
      <br />
      <Button className="ml-auto mt-8" disabled={isSubmitting || !isValid}>
        Envoyer la décision
      </Button>
    </form>
  );
};
