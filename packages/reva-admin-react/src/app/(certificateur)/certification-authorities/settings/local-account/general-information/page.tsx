"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { BackButton } from "@/components/back-button/BackButton";

import { useGeneralInformationLocalAccountPage } from "./generalInformationLocalAccountPage.hook";

export default function CertificationAuthorityLocalAccountGeneralInformationPage() {
  const { certificationAuthorityLocalAccount } =
    useGeneralInformationLocalAccountPage();

  const account = certificationAuthorityLocalAccount?.account;

  return (
    <div data-test="general-information-local-account-page">
      <Breadcrumb
        segments={[
          {
            label: "Paramètres",
            linkProps: {
              href: "/certification-authorities/settings/local-account",
            },
          },
        ]}
        currentPageLabel="Informations générales"
      />
      <h2>Informations liées au compte local</h2>
      <p>
        Ces informations sont strictement confidentielles et ne seront pas
        partagées aux autres usagers de la plateforme.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input
          data-test="account-lastname-input"
          label="Nom de la personne ou du compte"
          disabled
          nativeInputProps={{
            value: account?.lastname ?? "",
          }}
        />
        <Input
          data-test="account-firstname-input"
          label="Prénom (optionnel)"
          disabled
          nativeInputProps={{
            value: account?.firstname ?? "",
          }}
        />
        <Input
          data-test="account-email-input"
          label="Email de connexion"
          disabled
          nativeInputProps={{
            value: account?.email ?? "",
          }}
        />
      </div>
      <h2 className="mt-8">Contact référent </h2>
      <p>
        Le contact référent est le service administratif pour le suivi des
        dossiers. Ses coordonnées seront transmises aux candidats et aux AAP à
        des étapes clés du parcours VAE (faisabilité, validation, jury) pour
        faciliter les échanges.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Input
          data-test="contact-full-name-input"
          className="col-span-full"
          label="Service associé "
          disabled
          nativeInputProps={{
            value: certificationAuthorityLocalAccount?.contactFullName ?? "",
          }}
        />
        <Input
          data-test="contact-email-input"
          label="Email"
          disabled
          hintText="Privilégiez une adresse e-mail pérenne pour faciliter les échanges avec les candidats et les AAP"
          nativeInputProps={{
            value: certificationAuthorityLocalAccount?.contactEmail ?? "",
          }}
        />
        <Input
          data-test="contact-phone-input"
          className="md:max-w-[280px] md:mt-6"
          label="Téléphone (optionnel)"
          disabled
          nativeInputProps={{
            value: certificationAuthorityLocalAccount?.contactPhone ?? "",
          }}
        />
      </div>
      <BackButton href="/certification-authorities/settings/local-account">
        Retour
      </BackButton>
    </div>
  );
}
