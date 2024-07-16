import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { PageLayout } from "@/layouts/page.layout";

import { FormOptionalFieldsDisclaimer } from "@/components/legacy/atoms/FormOptionalFieldsDisclaimer/FormOptionalFieldsDisclaimer";
import { SelectDepartment } from "@/components/select-department/SelectDepartment.component";
import SubmitButton from "@/components/forms/SubmitButton";

import { isFeatureActive } from "@/utils/getActiveFeatures";
import Link from "next/link";
import { registerCandidate } from "./registration.actions";

export default async function Registration() {
  const isCandidacyCreationDisabled = await isFeatureActive(
    "CANDIDACY_CREATION_DISABLED",
  );

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
                href="https://metabase.vae.gouv.fr/public/dashboard/e5a2b59d-26b2-443b-a874-d4561f1322eb"
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

          <form action={registerCandidate} className="flex flex-col">
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
                  }}
                />
                <Input
                  label="Nom"
                  nativeInputProps={{
                    name: "lastname",
                    required: true,
                    autoComplete: "family-name",
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
                  }}
                />
              </div>

              <SelectDepartment
                required
                hint="Sélectionnez votre département de résidence"
              />
            </fieldset>
            <SubmitButton
              className="my-6 self-end w-full sm:w-auto flex justify-center"
              label="Créer votre compte"
            />
          </form>

          <div className="border-t border-gray-200 pt-6">
            <Link className="text-gray-500" href="/login">
              J’ai déjà un compte
            </Link>
          </div>
        </>
      )}
    </PageLayout>
  );
}
