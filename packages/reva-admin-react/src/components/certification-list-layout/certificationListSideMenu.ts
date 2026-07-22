import { SideMenuProps } from "@codegouvfr/react-dsfr/SideMenu";

import { CertificationStatus } from "@/graphql/generated/graphql";

// Helpers d'URL et d'item du menu latéral des listes de certifications,
// paramétrés par basePath.
export const createCertificationListSideMenu = ({
  basePath,
  searchFilter,
  statusParam,
  visibleParam,
}: {
  basePath: string;
  searchFilter: string;
  statusParam?: string;
  visibleParam?: string;
}) => {
  const hrefSideMenu = (
    status?: CertificationStatus,
    visible?: "true" | "false",
  ) => {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }

    if (visible) {
      params.set("visible", visible);
    }

    params.set("page", "1");

    if (searchFilter) {
      params.set("search", searchFilter);
    }

    return `${basePath}?${params.toString()}`;
  };

  const menuItem = (
    text: string,
    status?: CertificationStatus,
    visible?: "true" | "false",
  ): SideMenuProps.Item => ({
    isActive: status === statusParam && visible === visibleParam,
    linkProps: {
      href: hrefSideMenu(status, visible),
      target: "_self",
    },
    text,
  });

  return { hrefSideMenu, menuItem };
};
