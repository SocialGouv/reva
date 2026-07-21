"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/back-button/BackButton";
import { Panel } from "@/components/layout/Panel";

import { CertificationAuthorityCard } from "./_components/CertificationAuthorityCard";
import { CertificationAuthorityLocalAccountCard } from "./_components/CertificationAuthorityLocalAccountCard";
import { useCertificationAuthorityDetailsPage } from "./certificationAuthorityDetailsPage.hook";

export default function CertificationAuthorityDetailsPage() {
  const router = useRouter();
  const {
    certification,
    certificationAuthority,
    certificationAuthorityLocalAccounts,
  } = useCertificationAuthorityDetailsPage();
  if (
    !certification ||
    !certificationAuthority ||
    !certificationAuthorityLocalAccounts
  ) {
    return null;
  }
  return (
    <Panel>
      <Breadcrumb
        currentPageLabel="Certificateur"
        className="mb-4 mt-0"
        segments={[
          {
            label: "Mes candidatures",
            linkProps: {
              href: "../../",
            },
          },
          {
            label: `RNCP ${certification.codeRncp} : ${certification.label}`,
            linkProps: {
              href: "../",
            },
          },
        ]}
      />

      <div className="flex flex-col">
        <h1>Certificateur</h1>
        <p>
          Le certificateur étudiera les dossiers de faisabilité et de validation
          de cette candidature.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-12">
        <CertificationAuthorityCard
          label={certificationAuthority?.label}
          contactEmail={certificationAuthority?.contactEmail}
          contactPhone={certificationAuthority?.contactPhone}
        />
        {certificationAuthorityLocalAccounts.map((account) => (
          <CertificationAuthorityLocalAccountCard
            key={account?.contactFullName}
            label={account?.contactFullName ?? "Inconnu"}
            certificationAuthorityLabel={certificationAuthority?.label}
            contactEmail={account?.contactEmail}
            contactPhone={account?.contactPhone}
          />
        ))}
      </div>

      <BackButton navigateBack={() => router.push("../")} />
    </Panel>
  );
}
