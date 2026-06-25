"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";

import { CertificationAuthorityCard } from "@/components/candidacy-summary/certification-authority/CertificationAuthorityCard";

import { useCertificationAuthoritySelection } from "./certificationAuthoritySelection.hooks";

const CertificationAuthoritySelectionPage = () => {
  const { candidacyId, certificationAuthorityId } = useParams<{
    candidacyId: string;
    certificationAuthorityId: string;
  }>();

  const { certificationAuthority } = useCertificationAuthoritySelection({
    certificationAuthorityId,
  });

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
      </div>
      <Button
        priority="secondary"
        linkProps={{
          href: `/candidacies/${candidacyId}/summary/multiple-certification-authorities-selection/certification-authorities-list`,
        }}
      >
        Retour
      </Button>
    </div>
  );
};

export default CertificationAuthoritySelectionPage;
