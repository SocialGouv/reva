"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";

const AgencesLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full flex flex-col md:flex-row gap-10 md:gap-0">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px] min-h-[300px]"
        align="left"
        burgerMenuButtonText="Agences"
        title="Agences"
        items={[]}
      />
      {children}
    </div>
  );
};

export default AgencesLayout;
