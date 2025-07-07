"use client";

import { redirect } from "next/navigation";
import { useCertificateurLayout } from "./certificateur-layout.hook";

export default function CertificateurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    displayCguCertificateur,
    getCertificationAuthorityStructureCGURequestLoading,
  } = useCertificateurLayout();

  if (getCertificationAuthorityStructureCGURequestLoading) {
    return null;
  }

  // Si la structure dont fait partie le certificateur connecté n'a pas accepté la version la plus récente des CGU,
  // on affiche le formulaire de consentement. Tant que le responsable de certification ne les a pas acceptés,
  // tous les certificateurs liés à cette structure n'auront plus accès à la plateforme.
  // Si le responsable de certification décide d'ignorer le formulaire de consentement, il sera déconnecté.
  if (displayCguCertificateur) {
    redirect("/certificateur-cgu");
  }

  return <div className="w-full">{children}</div>;
}
