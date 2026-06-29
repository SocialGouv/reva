"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useParams, useRouter } from "next/navigation";

import { CertificationAuthorityCard } from "@/components/candidacy-summary/certification-authority/CertificationAuthorityCard";
import { CertificationAuthorityLocalAccountCard } from "@/components/candidacy-summary/certification-authority/CertificationAuthorityLocalAccountCard";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useCertificationAuthoritySelection } from "./certificationAuthoritySelection.hooks";

const CertificationAuthoritySelectionPage = () => {
  const router = useRouter();
  const { candidacyId, certificationAuthorityId } = useParams<{
    candidacyId: string;
    certificationAuthorityId: string;
  }>();

  const {
    certificationAuthority,
    certificationAuthorityLocalAccounts,
    updateCertificationAuthority,
  } = useCertificationAuthoritySelection({
    candidacyId,
    certificationAuthorityId,
  });

  const handleUpdateCertificationAuthority = async () => {
    try {
      await updateCertificationAuthority.mutateAsync({ candidacyId });
      successToast("Le certificateur a été mis à jour");
      router.push(`/candidacies/${candidacyId}/summary`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

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
        {certificationAuthorityLocalAccounts.map((localAccount) => (
          <CertificationAuthorityLocalAccountCard
            key={localAccount.id}
            label={localAccount.contactFullName ?? "Inconnu"}
            certificationAuthorityLabel={
              certificationAuthority?.label ?? "Inconnu"
            }
            contactEmail={localAccount.contactEmail ?? undefined}
            contactPhone={localAccount.contactPhone ?? undefined}
          />
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/summary/multiple-certification-authorities-selection/certification-authorities-list`,
          }}
        >
          Retour
        </Button>
        <Button
          priority="tertiary no outline"
          iconId="fr-icon-arrow-left-right-line"
          onClick={handleUpdateCertificationAuthority}
          disabled={updateCertificationAuthority.isPending}
        >
          Changer de certificateur
        </Button>
      </div>
    </div>
  );
};

export default CertificationAuthoritySelectionPage;
