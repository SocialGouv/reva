"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { PageLayout } from "@/layouts/page.layout";

import { useUpdateContact } from "./update-contact.hooks";

export default function UpdateContact() {
  const router = useRouter();

  const { candidate, refetch } = useCandidacy();

  const { updateContact } = useUpdateContact();

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
        successToast("Vos informations ont été mises à jour avec succès");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      graphqlErrorToast(error);
    }
  };

  return (
    <PageLayout
      className="max-w-4xl"
      data-test={`project-update-contact`}
      displayBackToHome
    >
      <h2 className="mt-6 mb-2">Mes informations</h2>
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
          Enregistrer
        </Button>
      </form>
    </PageLayout>
  );
}
