import { ReactNode } from "react";

export const SmallNotice = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={`text-blue-light-text-default-info flex items-start ${className}`}
  >
    <span className="fr-icon--sm fr-icon-info-fill mr-2 -mt-[1px]" />
    <p className="text-sm mb-0">{children}</p>
  </div>
);
