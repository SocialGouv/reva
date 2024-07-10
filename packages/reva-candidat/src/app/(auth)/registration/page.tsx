"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";
import Button from "@codegouvfr/react-dsfr/Button";

import { PageLayout } from "@/layouts/page.layout";

import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { SelectDepartment } from "@/components/select-department/SelectDepartment.component";

import { useRegistration } from "./registration.hooks";

export default function Registration() {
  const { isFeatureActive } = useFeatureflipping();

  const isCandidacyCreationDisabled = isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

  const router = useRouter();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState<string | undefined>();

  const { askForRegistration } = useRegistration();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await askForRegistration.mutateAsync({
        firstname,
        lastname,
        phone,
        email,
        departmentId: departmentId!,
      });

      if (response) {
        router.push("/registration-confirmation");
      }
    } catch (error) {}
  };

  return (
    <PageLayout className="max-w-4xl" title="Création de compte">
      {isCandidacyCreationDisabled ? (
        <Alert
          className="mb-6"
          severity="warning"
          title={
            <p className="font-normal">
              Le dépôt de nouvelles candidatures est temporairement
              indisponible. Nous vous remercions de votre patience et nous
              excusons pour tout désagrément.
            </p>
          }
        />
      ) : (
        <Alert
          className="mb-6"
          severity="warning"
          title={
            <div className="flex flex-col items-start gap-2 font-normal">
              <h2 className="font-bold text-xl">Attention</h2>
              <p>Seuls quelques diplômes sont actuellement éligibles : </p>
              <a
                className="fr-link"
                href="https://airtable.com/shrhMGpOWNPJA15Xh/tblWDa9HN0cuqLnAl"
                target="_blank"
                rel="noreferrer"
                title="Voir tous les diplômes actuellement disponibles via France VAE - nouvelle fenêtre"
              >
                Voir tous les diplômes actuellement disponibles via France VAE
              </a>
              <p>
                Les salariés ayant un contrat de travail de droit public, les
                retraités et les étudiants{" "}
                <strong>
                  ne peuvent pas bénéficier du financement d’un parcours France
                  VAE à date.
                </strong>
              </p>
              <a
                className="fr-link"
                href="https://airtable.com/appQT21E7Sy70YfSB/shrgvhoKYW1EsXUu5/tblQgchiTKInxOqqr"
                target="_blank"
                rel="noreferrer"
                title="En cas de question, contactez un Point Relais Conseil - nouvelle fenêtre"
              >
                En cas de question, contactez un Point Relais Conseil
              </a>
            </div>
          }
        />
      )}

      {!isCandidacyCreationDisabled && (
        <>
          <h1 className="text-3xl font-bold text-dsfrBlue-500 mb-0">
            Bienvenue <span aria-hidden="true">🤝</span>,
          </h1>

          <form onSubmit={onSubmit} className="flex flex-col">
            <fieldset>
              <legend>
                <h2 className="mt-6 mb-2">Créer votre compte</h2>
              </legend>

              <FormOptionalFieldsDisclaimer
                className="mb-4"
                label="Tous les champs sont obligatoires."
              />

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

              <SelectDepartment
                required
                hint="Sélectionnez votre département de résidence"
                departmentId={departmentId}
                onSelectDepartment={(department) => {
                  setDepartmentId(department?.id);
                }}
              />
            </fieldset>

            <Button
              disabled={askForRegistration.isPending}
              data-test={`project-contact-add`}
              className="my-6 self-end w-full sm:w-auto flex justify-center"
            >
              Créer votre compte
            </Button>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <button
              data-test="project-contact-login"
              onClick={() => {
                router.push("/login");
              }}
              className="text-gray-500 underline"
            >
              J’ai déjà un compte
            </button>
          </div>
        </>
      )}
    </PageLayout>
  );
}
