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
      <div className="grid grid-cols-2 gap-2">
        {localAccounts.map((localAccount) => (
          <div
            key={localAccount.id}
            className="border border-dsfrGray-200 p-6 flex flex-col gap-y-4"
          >
            <p className="mb-0 flex flex-row items-center font-bold text-lg">
              {localAccount.account.firstname} {localAccount.account.lastname}
            </p>
            <p className="mb-0 flex flex-row items-center">
              <span
                className="fr-icon-mail-line fr-icon--sm mr-2"
                aria-hidden="true"
              />
              <a
                className="hover:underline bg-none"
                href={`mailto:${localAccount.account.email}`}
              >
                {localAccount.account.email}
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
