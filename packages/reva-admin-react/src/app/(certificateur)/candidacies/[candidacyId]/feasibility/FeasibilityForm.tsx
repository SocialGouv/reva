import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

const schema = z
  .object({
    decision: z.enum(["Admissible", "Rejected", "Incomplete"], {
      errorMap: () => {
        return { message: "Ce champ est obligatoire" };
      },
    }),
    comment: z.string(),
    infoFile: z.object({ 0: z.instanceof(File).optional() }),
  })
  .superRefine(({ decision, comment }, { addIssue }) => {
    if (decision === "Incomplete" && !comment) {
      addIssue({
        path: ["comment"],
        code: "too_small",
        minimum: 1,
        type: "string",
        inclusive: true,
        message: "Ce champ est obligatoire",
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
          <h1>Envoi de la décision</h1>
          <FormOptionalFieldsDisclaimer />
        </legend>
        <RadioButtons
          legend="Décision prise concernant ce dossier"
          options={[
            {
              label: (
                <p className="mb-0">
                  Ce dossier est <strong>recevable</strong>
                </p>
              ),
              nativeInputProps: {
                ...register("decision"),
                value: "Admissible",
              },
            },
            {
              label: (
                <p className="mb-0">
                  Ce dossier est considéré comme{" "}
                  <strong>incomplet ou incorrect</strong>
                </p>
              ),
              hintText:
                "Un dossier est incorrect ou incomplet si il manque des éléments nécessaires à son traitement (tels que des pièces jointes ou des informations dans le document), si le dossier n’est pas le bon, s’il manque des éléments ou si les pièces jointes sont inexploitables, erronées etc... Il sera renvoyé à l’AAP qui devra le compléter ou le corriger rapidement.",
              nativeInputProps: {
                ...register("decision"),
                value: "Incomplete",
              },
            },
            {
              label: (
                <p className="mb-0">
                  Ce dossier n'est <strong>pas recevable</strong>
                </p>
              ),
              hintText:
                "La non recevabilité d'un dossier ne peut être prononcée que sur un dossier complet ET pour lequel les activités du candidat ne semblent pas correspondre au référentiel de la certification (ou bloc) visée. Le candidat ne pourra plus demander de recevabilité sur cette certification durant l'année civile en cours.",
              nativeInputProps: { ...register("decision"), value: "Rejected" },
            },
          ]}
          state={errors.decision ? "error" : "default"}
          stateRelatedMessage={errors.decision?.message}
        />
        <Input
          classes={{ nativeInputOrTextArea: "!min-h-[200px]" }}
          className="max-w-md"
          textArea
          label={
            <span className="uppercase text-xs font-semibold">
              PRÉCISEZ LES MOTIFS DE VOTRE DÉCISION{" "}
              {decision !== "Incomplete" ? "(OPTIONNEL)" : ""}
            </span>
          }
          hintText="Texte de description libre"
          nativeTextAreaProps={register("comment")}
          state={errors.comment ? "error" : "default"}
          stateRelatedMessage={errors.comment?.message}
        />
        <Upload
          label="Joindre le courrier de recevabilité"
          hint="Ce courrier sera joint au message envoyé au candidat. L'architecte de parcours ne le recevra pas"
          nativeInputProps={register("infoFile")}
        />
      </fieldset>
      <br />
      <Notice title="Rappel : les motifs de votre décision seront transmis au candidat et à son architecte de parcours" />
      <Button className="ml-auto mt-8" disabled={isSubmitting || !isValid}>
        Envoyer la décision
      </Button>
    </form>
  );
};
