"use client";
import { Cgu } from "@/components/cgu/Cgu";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { redirect } from "next/navigation";
import { CguCertificateurForm } from "./_components/CguCertificateurForm";
import { useCguCertificateur } from "./cgu-certificateur.hook";
export default function CertificateurCguPage() {
  const {
    cguCertificateur,
    canAccessCguCertificateur,
    isCertificationRegistryManager,
  } = useCguCertificateur();

  if (!canAccessCguCertificateur) {
    redirect("/");
  }

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
      {isCertificationRegistryManager && <CguCertificateurForm />}
    </div>
  );
}
