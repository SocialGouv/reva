import { CertificationAuthorityLocalAccount } from "@/graphql/generated/graphql";
import { ReactNode } from "react";

export const CertificationAuthorityLocalAccountCard = ({
  certificationAuthorityLocalAccount,
  buttonComponent,
}: {
  certificationAuthorityLocalAccount: CertificationAuthorityLocalAccount;
  buttonComponent?: ReactNode;
}) => (
  <div className="flex flex-col justify-between p-6 border-[1px] border-[#DDD]">
    <div>
      <h6>{certificationAuthorityLocalAccount.account.firstname}</h6>
      <p>
        <span className="fr-icon-mail-line mr-2" />
        {certificationAuthorityLocalAccount.account.email}
      </p>
    </div>
    {buttonComponent}
  </div>
);
