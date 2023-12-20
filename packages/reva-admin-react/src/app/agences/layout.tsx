"use client";
import { useAgencesQueries } from "@/app/agences/agencesQueries";
import Button from "@codegouvfr/react-dsfr/Button";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

const menuItem = ({
  id,
  label,
  informationsCommerciales,
}: {
  id: string;
  label: string;
  informationsCommerciales?: {
    nom?: string | null;
  } | null;
}) => {
  const text = informationsCommerciales?.nom
    ? informationsCommerciales.nom
    : label;
  return {
    isActive: false,
    linkProps: {
      href: `/agences/${id}`,
      target: "_self",
    },
    text,
  };
};

const Skeleton = () => (
  <div className="ml-5 mt-6 h-8 animate-pulse bg-gray-100 w-64" />
);
const AgencesLayout = ({ children }: { children: ReactNode }) => {
  const { organisms, organismsStatus } = useAgencesQueries();
  const path = usePathname();
  const regex = new RegExp(/\/add-agence$/);
  const isAddAgence = regex.test(path);
  useEffect(() => {}, [organismsStatus]);

  return (
    <div className="w-full flex flex-col md:flex-row gap-10 md:gap-0">
      {organismsStatus == "pending" && (
        <div className="flex-shrink-0 md:w-[298px] pt-8 border-r">
          <Skeleton />
          <Skeleton />
        </div>
      )}
      {organismsStatus == "success" && organisms && (
        <SideMenu
          className="flex-shrink-0 md:w-[330px] side-bar-menu-add-button"
          align="left"
          classes={{ inner: "h-full" }}
          burgerMenuButtonText="Agences"
          title="Agences"
          items={
            [
              ...organisms.map(menuItem),
              !isAddAgence
                ? {
                    isActive: false,
                    linkProps: {
                      href: "/agences/add-agence/",
                      target: "_self",
                    },
                    text: (
                      <Button size="small" priority="secondary">
                        Ajouter une agence
                      </Button>
                    ),
                  }
                : {
                    linkProps: {
                      hidden: true,
                      href: "",
                    },
                    text: "",
                  },
            ] || []
          }
        />
      )}
      {organismsStatus == "error" && (
        <div className="md:w-[330px] text-red-500">
          Une erreur est survenue lors de la récupération de vos agences
        </div>
      )}

      {children}
    </div>
  );
};

export default AgencesLayout;
