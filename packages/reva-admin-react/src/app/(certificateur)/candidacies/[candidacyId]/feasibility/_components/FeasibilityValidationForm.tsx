import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FancyUpload } from "@/components/fancy-upload/FancyUpload";
import { FormButtons } from "@/components/form/form-footer/FormButtons";

const schema = z
  .object({
    decision: z.enum(["ADMISSIBLE", "REJECTED"], {
      errorMap: () => {
        return { message: "Merci de remplir ce champ" };
      },
    }),
    comment: z.string(),
    infoFile: z.object({ 0: z.instanceof(File).optional() }),
  })
  .superRefine(({ decision, comment }, { addIssue }) => {
    if (decision === "REJECTED" && !comment) {
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

export type FeasibilityValidationFormData = z.infer<typeof schema>;

export const FeasibilityValidationForm = ({
  onSubmit,
  className,
}: {
  onSubmit?(data: FeasibilityValidationFormData): void;
  className?: string;
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FeasibilityValidationFormData>({ resolver: zodResolver(schema) });

  const handleFormSubmit = handleSubmit((data) => onSubmit?.(data));

  const { decision } = useWatch({ control });

  return (
    <form className={`flex flex-col ${className}`} onSubmit={handleFormSubmit}>
      <fieldset>
        <legend>
          <h2>Décision concernant le dossier</h2>
        </legend>
        <RadioButtons
          legend="Sélectionnez si ce dossier est recevable ou non recevable. La décision et les motifs associés à celle-ci seront transmis au candidat et à son architecte accompagnateur de parcours."
          options={[
            {
              label: (
                <p className="mb-0 text-base">
                  Ce dossier <strong>est recevable</strong>
                </p>
              ),
              nativeInputProps: {
                ...register("decision"),
                value: "ADMISSIBLE",
              },
            },
            {
              label: (
                <p className="mb-0 text-base">
                  Ce dossier est <strong>non recevable</strong>
                </p>
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
              {decision === "ADMISSIBLE" ? "(optionnel)" : ""}
            </span>
          }
          nativeTextAreaProps={register("comment")}
          state={errors.comment ? "error" : "default"}
          stateRelatedMessage={errors.comment?.message}
        />
        <FancyUpload
          title="Joindre le courrier de recevabilité (optionnel)"
          description="Ce courrier sera joint au message envoyé au candidat."
          hint="Formats supportés : jpg, png, pdf avec un poids maximum de 2Mo"
          nativeInputProps={register("infoFile")}
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
