import { ReactNode } from "react";

export const CandidateBackground = (props: { children?: ReactNode }) => (
  <div className="xl:bg-candidate">
    <div className="fr-container lg:shadow-lifted bg-white xl:my-8">
      {props.children}
    </div>
  </div>
);
