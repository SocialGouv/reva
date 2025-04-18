"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { Cgu } from "../(aap)/cgu/_components/Cgu";
import {
  CertificateurLayoutUseCguCertificateur,
  useCertificateurLayout,
} from "./certificateur-layout.hook";

const CGUContainer = ({
  cguCertificateur,
}: {
  cguCertificateur: CertificateurLayoutUseCguCertificateur;
}) => {
  if (!cguCertificateur) {
    return null;
  }

  const parsedChapo =
    typeof cguCertificateur.chapo === "string"
      ? JSON.parse(cguCertificateur.chapo)
      : cguCertificateur.chapo;
  return (
    <div>
      <h1>Conditions générales d'utilisation</h1>
      <FormOptionalFieldsDisclaimer />
      <Cgu
        cguHtml={cguCertificateur.contenu ?? ""}
        chapo={parsedChapo}
        updatedAt={cguCertificateur.dateDeMiseAJour}
      />
      {/* <CguCertificateurForm /> */}
    </div>
  );
};

export default function CertificateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { displayCguCertificateur, cguCertificateur } =
    useCertificateurLayout();

  // Si la structure dont fait partie le certificateur connecté n'a pas accepté la version la plus récente des CGU,
  // on affiche le formulaire de consentement. Tant que le responsable de certification ne les a pas acceptés,
  // tous les certificateurs liés à cette structure n'auront plus accès à la plateforme.
  // Si le responsable de certification décide d'ignorer le formulaire de consentement, il sera déconnecté.
  if (displayCguCertificateur) {
    return <CGUContainer cguCertificateur={cguCertificateur} />;
  }

  return <div>{children}</div>;
}
