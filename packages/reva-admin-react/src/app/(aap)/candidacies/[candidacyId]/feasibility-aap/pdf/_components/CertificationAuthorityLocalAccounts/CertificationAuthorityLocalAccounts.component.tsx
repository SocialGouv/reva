import { GrayCard } from "@/components/card/gray-card/GrayCard";

import { useCertificationAuthorityLocalAccounts } from "./CertificationAuthorityLocalAccounts.hooks";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

interface Props {
  certificationAuthorityId: string;
  certificationId?: string;
  departmentId?: string;
}

export const CertificationAuthorityLocalAccounts = (
  props: Props,
): JSX.Element | null => {
  const { certificationAuthorityId, certificationId, departmentId } = props;

  const { certificationAuthority } = useCertificationAuthorityLocalAccounts(
    certificationAuthorityId,
  );

  let localAccounts =
    certificationAuthority.data
      ?.certification_authority_getCertificationAuthority
      ?.certificationAuthorityLocalAccounts || [];

  if (certificationId) {
    localAccounts = localAccounts.filter(
      (localAccount) =>
        localAccount.certifications.findIndex((c) => c.id == certificationId) !=
        -1,
    );
  }

  if (departmentId) {
    localAccounts = localAccounts.filter(
      (localAccount) =>
        localAccount.departments.findIndex((c) => c.id == departmentId) != -1,
    );
  }

  const { isFeatureActive } = useFeatureflipping();

  const isActive = isFeatureActive(
    "DF_DISPLAY_LOCAL_ACCOUNTS_OF_CERTIFICATION_AUTHORITY",
  );

  if (!isActive || localAccounts.length == 0) {
    return null;
  }

  return (
    <div>
      {<h4>Autorité de certification: comptes locaux</h4>}
      {localAccounts.map((localAccount) => (
        <GrayCard key={localAccount.id} className="gap-2">
          <p className="mb-0">
            {localAccount.account.firstname} {localAccount.account.lastname}
          </p>
          <p className="mb-0">{localAccount.account.email}</p>
        </GrayCard>
      ))}
    </div>
  );
};
