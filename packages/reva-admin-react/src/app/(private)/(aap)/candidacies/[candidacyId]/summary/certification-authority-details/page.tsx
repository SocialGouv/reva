"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

import { CertificationAuthorityCard } from "@/components/candidacy-summary/certification-authority/CertificationAuthorityCard";
import { CertificationAuthorityLocalAccountCard } from "@/components/candidacy-summary/certification-authority/CertificationAuthorityLocalAccountCard";

import { useCertificationAuthorityDetails } from "./certificationAuthorityDetails.hooks";

const CertificationAuthorityDetailsPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { certificationAuthority, certificationAuthorityLocalAccounts } =
    useCertificationAuthorityDetails({ candidacyId });

  return (
    <div className="flex flex-col">
      <h1>Certificateur</h1>
      <p>
        Le certificateur étudiera les dossiers de faisabilité et de validation
        de cette candidature.
      </p>

      <div className="flex flex-col gap-4 mb-12">
        {certificationAuthority && (
          <CertificationAuthorityCard
            label={certificationAuthority?.label}
            contactEmail={certificationAuthority.contactEmail}
            contactPhone={certificationAuthority.contactPhone}
          />
        )}
        {certificationAuthority &&
          certificationAuthorityLocalAccounts?.map((localAccount) => (
            <CertificationAuthorityLocalAccountCard
              key={localAccount.contactFullName}
              label={localAccount.contactFullName}
              certificationAuthorityLabel={certificationAuthority.label}
              contactEmail={localAccount.contactEmail}
              contactPhone={localAccount.contactPhone}
            />
          ))}
      </div>
      <Button
        priority="secondary"
        linkProps={{ href: `/candidacies/${candidacyId}/summary` }}
      >
        Retour
      </Button>
    </div>
  );
};

export default CertificationAuthorityDetailsPage;
