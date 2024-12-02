import { CertificationAuthority } from "@/graphql/generated/graphql";
import { ReactNode } from "react";

export const CertificationAuthorityCard = ({
  certificationAuthority,
  buttonComponent,
}: {
  certificationAuthority: CertificationAuthority;
  buttonComponent?: ReactNode;
}) => (
  <div
    key={certificationAuthority.id}
    className="flex flex-col justify-between p-6 border-[1px] border-[#DDD]"
  >
    <div>
      <h6>{certificationAuthority.label}</h6>
      <p>
        <span className="fr-icon-mail-line mr-2" />
        {certificationAuthority.contactEmail}
      </p>
    </div>
    {buttonComponent}
  </div>
);
