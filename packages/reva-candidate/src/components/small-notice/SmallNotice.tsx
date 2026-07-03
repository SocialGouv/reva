import { ReactNode } from "react";

export const SmallNotice = ({
  className = "",
  children,
  "data-testid": dataTest,
}: {
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}) => (
  <div
    className={`text-blue-light-text-default-info flex items-start ${className}`}
    data-testid={dataTest || ""}
  >
    <span className="fr-icon--sm fr-icon-info-fill mr-2 -mt-[1px]" />
    <p className="text-sm mb-0">{children}</p>
  </div>
);
