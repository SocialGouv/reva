import { ReactNode } from "react";

export const SmallNotice = ({ children }: { children: ReactNode }) => (
  <div className="text-blue-light-text-default-info flex items-start ">
    <span className="fr-icon--sm fr-icon-info-fill mr-2 -mt-[1px]" />
    <p className="text-sm">{children}</p>
  </div>
);
