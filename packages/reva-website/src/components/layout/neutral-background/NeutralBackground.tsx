import { ReactNode } from "react";

export const NeutralBackground = (props: { children?: ReactNode }) => (
  <div>
    <div className="fr-container lg:shadow-lifted bg-white xl:my-8 xl:!px-20 py-10">
      {props.children}
    </div>
  </div>
);
