"use client";
import { Cgu } from "@/components/cgu/Cgu";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import Button from "@codegouvfr/react-dsfr/Button";
import { redirect } from "next/navigation";
import { useState } from "react";
import { CguAwaitingManagerValidationNotice } from "./_components/CguAwaitingManagerValidationNotice";
import { CguCertificateurForm } from "./_components/CguCertificateurForm";
import { useCguCertificateur } from "./cgu-certificateur.hook";

export default function CertificateurCguPage() {
  const {
    cguCertificateur,
    canAccessCguCertificateur,
    isCertificationRegistryManager,
    certificationAuthorityManagerFirstname,
    certificationAuthorityManagerLastname,
  } = useCguCertificateur();

  const [showCgu, setShowCgu] = useState(false);

  if (!canAccessCguCertificateur) {
    redirect("/");
  }

  if (!cguCertificateur) {
    return null;
  }

  if (!isCertificationRegistryManager && !showCgu) {
    return (
      <CguAwaitingManagerValidationNotice
        certificationAuthorityManagerFirstname={
          certificationAuthorityManagerFirstname
        }
        certificationAuthorityManagerLastname={
          certificationAuthorityManagerLastname
        }
        setShowCgu={setShowCgu}
      />
    );
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
      {isCertificationRegistryManager ? (
        <CguCertificateurForm />
      ) : (
        <Button priority="secondary" onClick={() => setShowCgu(false)}>
          Retour
        </Button>
      )}
    </div>
  );
}
