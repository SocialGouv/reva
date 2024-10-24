import { graphqlErrorToast } from "@/components/toast/toast";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ActiveDropoutReasons, useDropout } from "./useDropout";

const schema = z.object({
  otherReasonContent: z.string().optional(),
  dropOutReasonId: z.string().min(1, "Merci de remplir ce champ"),
  hasConfirmedWrittenConsent: z
    .boolean()
    .refine((val) => val, "Merci de remplir ce champ"),
});

export const DropoutForm = ({
  activeDropoutReasons,
}: {
  activeDropoutReasons: NonNullable<ActiveDropoutReasons>;
}) => {
  const router = useRouter();
  const { candidacyId, dropoutCandidacyById } = useDropout();
  const form = useForm({
    defaultValues: {
      otherReasonContent: "",
      dropOutReasonId: "",
      hasConfirmedWrittenConsent: false,
    },
    resolver: zodResolver(schema),
    mode: "all",
    reValidateMode: "onChange",
  });

  const dropOutReasonId = useWatch({
    control: form.control,
    name: "dropOutReasonId",
  });

  return (
    <>
      <form
        className="flex flex-col gap-y-2 mt-6"
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await dropoutCandidacyById.mutateAsync({
              dropoutReasonId: data.dropOutReasonId,
              otherReasonContent: data.otherReasonContent,
            });
            router.push(`/candidacies/${candidacyId}/summary`);
          } catch (error) {
            console.error(error);
            graphqlErrorToast(error);
          }
        })}
      >
        <Select
          state={form.formState.errors.dropOutReasonId ? "error" : "default"}
          stateRelatedMessage={form.formState.errors.dropOutReasonId?.message}
          label="Quelle est la raison de l'abandon ?"
          nativeSelectProps={form.register("dropOutReasonId")}
        >
          <option value="" disabled>
            Choisir une raison
          </option>
          {activeDropoutReasons.map((reason) => (
            <option key={reason.id} value={reason.id}>
              {reason.label}
            </option>
          ))}
        </Select>
        {dropOutReasonId === "0ff79cb7-1a9d-4e70-a17c-cfc3f6b9b204" && (
          <Input
            label="Autre raison (optionnel)"
            textArea
            hintText="Texte de description libre"
            nativeTextAreaProps={form.register("otherReasonContent")}
          />
        )}

        <Checkbox
          state={
            form.formState.errors.hasConfirmedWrittenConsent
              ? "error"
              : "default"
          }
          stateRelatedMessage={
            form.formState.errors.hasConfirmedWrittenConsent?.message
          }
          options={[
            {
              label:
                "Je certifie avoir une trace écrite du candidat confirmant son choix d’abandonner.",
              nativeInputProps: form.register("hasConfirmedWrittenConsent"),
            },
          ]}
        />
        <Button className="self-end" disabled={form.formState.isSubmitting}>
          Déclarer l'abandon du candidat
        </Button>
      </form>
    </>
  );
};
