import { ReactNode } from "react";

export const OrganismBackground = (props: { children?: ReactNode }) => (
  <div className="xl:bg-organism">
    <div className="fr-container lg:shadow-lifted bg-white xl:my-8 xl:!px-20 py-10">
      {props.children}
    </div>
  </div>
);
