"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@codegouvfr/react-dsfr/Input";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";

import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";

import { useUpdateContact } from "./update-contact.hooks";
import { useCandidacy } from "@/components/candidacy/candidacy.context";

const modalUpdateEmail = createModal({
  id: "project-update-email",
  isOpenedByDefault: false,
});

export default function UpdateContact() {
  const router = useRouter();

  const { candidate, refetch } = useCandidacy();

  const { updateContact } = useUpdateContact();

  const isModalOpen = useIsModalOpen(modalUpdateEmail);
  useIsModalOpen(modalUpdateEmail, {
    onConceal: () => {
      if (!isModalOpen) return;

      setTimeout(() => {
        router.push("/");
      }, 300);
    },
  });

  const [firstname, setFirstname] = useState(candidate.firstname);
  const [lastname, setLastname] = useState(candidate.lastname);
  const [phone, setPhone] = useState(candidate.phone);
  const [email, setEmail] = useState(candidate.email);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await updateContact.mutateAsync({
        candidateId: candidate.id,
        candidateData: {
          firstname,
          lastname,
          phone,
          email,
        },
      });
      if (response) {
        refetch();

        if (candidate.email != email) {
          modalUpdateEmail.open();
        } else {
          router.push("/");
        }
      }
    } catch (error) {}
  };

  return (
    <PageLayout
      className="max-w-4xl"
      data-test={`project-update-contact`}
      displayBackToHome
    >
      <h2 className="mt-6 mb-2">Modifiez vos informations</h2>
      <FormOptionalFieldsDisclaimer
        className="mb-4"
        label="Tous les champs sont obligatoires."
      />

      <form onSubmit={onSubmit} className="flex flex-col">
        <fieldset>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Prénom"
              nativeInputProps={{
                name: "firstname",
                required: true,
                autoComplete: "given-name",
                value: firstname,
                onChange: (e) => {
                  setFirstname(e.target.value);
                },
              }}
            />
            <Input
              label="Nom"
              nativeInputProps={{
                name: "lastname",
                required: true,
                autoComplete: "family-name",
                value: lastname,
                onChange: (e) => {
                  setLastname(e.target.value);
                },
              }}
            />
            <Input
              className="sm:pt-6"
              label="Téléphone"
              nativeInputProps={{
                name: "phone",
                minLength: 10,
                required: true,
                type: "tel",
                autoComplete: "tel",
                value: phone,
                onChange: (e) => {
                  setPhone(e.target.value);
                },
              }}
            />
            <Input
              label="Email"
              hintText="Format attendu : nom@domaine.fr"
              nativeInputProps={{
                name: "email",
                required: true,
                type: "email",
                autoComplete: "email",
                spellCheck: "false",
                value: email,
                onChange: (e) => {
                  setEmail(e.target.value);
                },
              }}
            />
          </div>
        </fieldset>

        <Button
          disabled={updateContact.isPending}
          data-test={`project-contact-save`}
          className="my-6 self-end w-full sm:w-auto flex justify-center"
        >
          Modifiez les informations
        </Button>
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
    </PageLayout>
  );
}
