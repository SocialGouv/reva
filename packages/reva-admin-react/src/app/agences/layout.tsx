"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useAgencesQueries } from "@/app/agences/agenceQueries";

const menuItem = ({ id, label }: { id: string; label: string }) => ({
  isActive: false,
  linkProps: {
    href: `#${id}`, // TODO: add agence page
    target: "_self",
  },
  text: label,
});

const Skeleton = () => (
  <div className="ml-5 mt-6 h-8 animate-pulse bg-gray-100 w-64" />
);
const AgencesLayout = ({ children }: { children: ReactNode }) => {
  const { agences, agencesStatus } = useAgencesQueries();

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 md:gap-0">
      {agencesStatus == "pending" && (
        <div className="flex-shrink-0 md:w-[298px] pt-8 border-r">
          <Skeleton />
          <Skeleton />
        </div>
      )}
      {agencesStatus == "success" && (
        <SideMenu
          className="flex-shrink-0 md:w-[330px]"
          align="left"
          classes={{ inner: "h-full" }}
          burgerMenuButtonText="Agences"
          title="Agences"
          items={agences?.map(menuItem) || []}
        />
      )}
      {agencesStatus == "error" && (
        <div className="md:w-[330px] text-red-500">
          Une erreur est survenue lors de la récupération de vos agences
        </div>
      )}

      {children}
    </div>
  );
};

export default AgencesLayout;
