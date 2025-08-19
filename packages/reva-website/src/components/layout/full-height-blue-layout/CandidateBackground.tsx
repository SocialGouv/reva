import { ReactNode } from "react";

export const CandidateBackground = (props: { children?: ReactNode }) => (
  <div className="xl:bg-candidate flex-1">
    <div className="fr-container lg:shadow-lifted bg-white xl:my-8">
      {props.children}
    </div>
  </div>
);
