"use client";

import Breadcrumb from "@codegouvfr/react-dsfr/Breadcrumb";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/back-button/BackButton";
import { Panel } from "@/components/layout/Panel";

import { useCertificationAuthorityContactInfoPage } from "./certificationAuthorityContactInfo.hook";

export default function CertificationAuthorityContactInfoPage() {
  const router = useRouter();
  const { certification } = useCertificationAuthorityContactInfoPage();
  if (!certification) {
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

      <BackButton navigateBack={() => router.push("../")} />
    </Panel>
  );
}
