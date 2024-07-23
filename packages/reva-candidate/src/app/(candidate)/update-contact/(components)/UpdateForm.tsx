"use client";
import { useRouter } from "next/navigation";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import SubmitButton from "@/components/forms/SubmitButton";
import { updateContact } from "../update-contact.actions";
import { useFormState } from "react-dom";
import { FormatedCandidacy } from "@/app/home.loaders";

const modalUpdateEmail = createModal({
  id: "project-update-email",
  isOpenedByDefault: false,
});

const initialState: Awaited<ReturnType<typeof updateContact>> = {
  errors: {},
  success: false,
}

export default function UpdateForm({
  candidate,
}: {
  candidate: FormatedCandidacy["candidate"];
}) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateContact, initialState);
  const isModalOpen = useIsModalOpen(modalUpdateEmail);

  useIsModalOpen(modalUpdateEmail, {
    onConceal: () => {
      if (!isModalOpen) return;
      setTimeout(() => {
        router.push("/");
      }, 300);
    },
  });

  if (state.success && !isModalOpen) {
    router.push("/");
    return;
  }

  return (
    <>
      <form
        action={(formData) => {
          formAction(formData);
          if (formData.get("email") !== candidate.email) {
            modalUpdateEmail.open();
          }
        }}
        className="flex flex-col"
      >
        <fieldset>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <input type="hidden" name="candidateId" value={candidate.id} />
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
      <modalUpdateEmail.Component
        title={
          <div className="flex gap-2">
            <span className="fr-icon-arrow-right-line fr-icon--lg"></span>
            <span>
              Votre demande de changement d&apos;e-mail de connexion a bien été
              prise en compte
            </span>
          </div>
        }
        size="large"
        concealingBackdrop={false}
      >
        <p className="my-4">
          Afin de valider ce changement, un e-mail d&apos;activation a été
          envoyé sur votre nouvelle adresse. Si vous ne trouvez pas notre
          e-mail, pensez à vérifier votre dossier de courriers indésirables
          (spams).
        </p>
      </modalUpdateEmail.Component>
    </>
  );
}
