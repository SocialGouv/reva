import { GrayCard } from "@/components/card/gray-card/GrayCard";
import { useCertificationAuthorityLocalAccounts } from "./CertificationAuthorityLocalAccounts.hooks";

interface Props {
  certificationAuthorityId: string;
  certificationId?: string;
  departmentId?: string;
}

export const CertificationAuthorityLocalAccounts = (
  props: Props,
): JSX.Element | null => {
  const { certificationAuthorityId, certificationId, departmentId } = props;

  const { certificationAuthority: certificationAuthorityQuery } =
    useCertificationAuthorityLocalAccounts(certificationAuthorityId);

  let localAccounts =
    certificationAuthorityQuery.data
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

  if (
    certificationAuthorityQuery.isLoading ||
    certificationAuthorityQuery.isFetching
  ) {
    return null;
  }

  const certificationAuthority =
    certificationAuthorityQuery.data
      ?.certification_authority_getCertificationAuthority;

  const showLocalAccountsContactInfo =
    certificationAuthority?.showLocalAccountsContactInfo;

  const showCertificationAuthorityContactInfo =
    certificationAuthority &&
    (localAccounts.length == 0 || !showLocalAccountsContactInfo);

  if (showCertificationAuthorityContactInfo) {
    return (
      <div>
        <h4>Contact certificateur</h4>
        <GrayCard className="gap-4">
          <h6 className="mb-0">{certificationAuthority.label}</h6>
          <p className="mb-0">{certificationAuthority.contactFullName}</p>
          <p className="mb-0">{certificationAuthority.contactEmail}</p>
        </GrayCard>
      </div>
    );
  }
  if (showLocalAccountsContactInfo) {
    return (
      <div>
        <h4>Contact(s) certificateur</h4>
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
  }

  return null;
};
