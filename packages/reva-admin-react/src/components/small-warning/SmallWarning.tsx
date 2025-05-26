import { ReactNode } from "react";

export const SmallWarning = ({ children }: { children: ReactNode }) => (
  <div className="text-dsfr-orange-500 flex items-start ">
    <span className="fr-icon--sm fr-icon-warning-fill mr-2 -mt-[1px]" />
    <p className="text-sm">{children}</p>
  </div>
);
