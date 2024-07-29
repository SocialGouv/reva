"use client";
import Input from "@codegouvfr/react-dsfr/Input";
import SubmitButton from "@/components/forms/SubmitButton";
import { updateContact } from "../update-contact.actions";
import { useFormState } from "react-dom";
import { FormatedCandidacy } from "@/app/home.loaders";

const initialState: Awaited<ReturnType<typeof updateContact>> = {
  errors: {},
};

export default function UpdateForm({
  candidate,
}: {
  candidate: FormatedCandidacy["candidate"];
}) {
  const [state, formAction] = useFormState(updateContact, initialState);

  return (
    <form action={formAction} className="flex flex-col">
      <fieldset>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input type="hidden" name="candidateId" value={candidate.id} />
          <input type="hidden" name="initialEmail" value={candidate.email} />
          <Input
            label="Prénom"
            state={state?.errors?.firstname ? "error" : "default"}
            stateRelatedMessage={state?.errors?.firstname as string}
            nativeInputProps={{
              name: "firstname",
              required: true,
              autoComplete: "given-name",
              defaultValue: candidate.firstname,
            }}
          />
          <Input
            label="Nom"
            state={state?.errors?.lastname ? "error" : "default"}
            stateRelatedMessage={state?.errors?.lastname as string}
            nativeInputProps={{
              name: "lastname",
              required: true,
              autoComplete: "family-name",
              defaultValue: candidate.lastname,
            }}
          />
          <Input
            className="sm:pt-6"
            label="Téléphone"
            state={state?.errors?.phone ? "error" : "default"}
            stateRelatedMessage={state?.errors?.phone as string}
            nativeInputProps={{
              name: "phone",
              minLength: 10,
              required: true,
              type: "tel",
              autoComplete: "tel",
              defaultValue: candidate.phone,
            }}
          />
          <Input
            label="Email"
            state={state?.errors?.email ? "error" : "default"}
            stateRelatedMessage={state?.errors?.email as string}
            hintText="Format attendu : nom@domaine.fr"
            nativeInputProps={{
              name: "email",
              required: true,
              type: "email",
              autoComplete: "email",
              spellCheck: "false",
              defaultValue: candidate.email,
            }}
          />
        </div>
      </fieldset>
      <SubmitButton
        label="Modifiez les informations"
        data-test={`project-contact-save`}
        className="my-6 self-end w-full sm:w-auto flex justify-center"
      />
    </form>
  );
}
