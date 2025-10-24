import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast } from "@/components/toast/toast";
import {
  sanitizedOptionalText,
  sanitizedText,
} from "@/utils/input-sanitization";

import { ActiveDropoutReasons, useDropout } from "./useDropout";

const schema = z.object({
  otherReasonContent: sanitizedOptionalText(),
  dropOutReasonId: sanitizedText(),
});

export const DropoutForm = ({
  activeDropoutReasons,
}: {
  activeDropoutReasons: NonNullable<ActiveDropoutReasons>;
}) => {
  const router = useRouter();
  const { candidacyId, dropoutCandidacyById } = useDropout();

  const defaultValues = useMemo(
    () => ({
      otherReasonContent: "",
      dropOutReasonId: "",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
    mode: "all",
    reValidateMode: "onChange",
  });

  const dropOutReasonId = useWatch({
    control: control,
    name: "dropOutReasonId",
  });

  return (
    <>
      <form
        className="flex flex-col"
        onReset={() => {
          reset(defaultValues);
        }}
        onSubmit={handleSubmit(async (data) => {
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
          className="m-0"
          state={errors.dropOutReasonId ? "error" : "default"}
          stateRelatedMessage={errors.dropOutReasonId?.message}
          label="Quelle est la raison de l'abandon ?"
          nativeSelectProps={{
            ...register("dropOutReasonId"),
          }}
        >
          <option value="" hidden>
            Sélectionner une option
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
            nativeTextAreaProps={register("otherReasonContent")}
          />
        )}

        <FormButtons
          backUrl={`/candidacies/${candidacyId}/summary/`}
          formState={{ isSubmitting, isDirty }}
          submitButtonLabel="Déclarer l'abandon du candidat"
        />
      </form>
    </>
  );
};
