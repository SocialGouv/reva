"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

const getCandidacyMenuQuery = graphql(`
  query getCandidacyMenu($candidacyId: ID!) {
    candidacyMenu_getCandidacyMenu(candidacyId: $candidacyId) {
      menuHeader {
        label
        url
        status
      }
      mainMenu {
        label
        url
        status
      }
    }
  }
`);

export const AapCandidacyLayout = ({ children }: { children: ReactNode }) => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyMenuResponse } = useQuery({
    queryKey: ["getCandidacyMenu", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyMenuQuery, {
        candidacyId,
      }),
  });

  const menuHeaderEntries =
    getCandidacyMenuResponse?.candidacyMenu_getCandidacyMenu?.menuHeader;

  const mainMenuEntries =
    getCandidacyMenuResponse?.candidacyMenu_getCandidacyMenu?.mainMenu;

  return (
    <div className="flex flex-col lg:flex-row">
      <CandidacyLayoutSideMenu>
        <ul>
          {menuHeaderEntries?.map((e) => (
            <MenuEntry key={e.label} menuEntry={e} />
          ))}
        </ul>
        <h2 className="mt-0.5 flex items-end text-xl font-semibold">
          Toutes les étapes
        </h2>
        <ul>
          {mainMenuEntries?.map((e) => (
            <MenuEntry key={e.label} menuEntry={e} />
          ))}
        </ul>
      </CandidacyLayoutSideMenu>
      {children}
    </div>
  );
};

const MenuEntry = ({
  menuEntry,
}: {
  menuEntry: {
    label: string;
    url: string;
    status: "INACTIVE" | "ACTIVE_WITHOUT_HINT" | "ACTIVE_WITH_EDIT_HINT";
  };
}) => (
  <li key={menuEntry.label} className="mt-5 mb-7 text-sm">
    {menuEntry.status === "INACTIVE" && <span>{menuEntry.label}</span>}
    {menuEntry.status === "ACTIVE_WITHOUT_HINT" && (
      <a className="bg-none" href={menuEntry.url}>
        {menuEntry.label}
      </a>
    )}

    {menuEntry.status === "ACTIVE_WITH_EDIT_HINT" && (
      <a href={menuEntry.url}>
        <div className="flex flex-col gap-2">
          <span className="text-dsfr-blue-france-sun-113 font-bold">
            {menuEntry.label}
          </span>
          <Button className="mt-1">Compléter</Button>
        </div>
      </a>
    )}
  </li>
);

const CandidacyLayoutSideMenu = ({ children }: { children: ReactNode }) => (
  <nav
    role="navigation"
    aria-label="Menu latéral"
    className="fr-sidemenu bg-white h-full min-w-[300px] mb-2"
  >
    <div className="h-full md:border-r mr-1 lg:mr-0">
      <div className="fr-sidemenu__inner shadow-none pr-0 h-full md:pb-24">
        <button
          className="fr-sidemenu__btn"
          aria-controls="fr-sidemenu-wrapper"
          aria-expanded="false"
          data-fr-js-collapse-button="true"
        >
          Accéder aux étapes du parcours
        </button>
        <div
          className="fr-collapse"
          id="fr-sidemenu-wrapper"
          data-fr-js-collapse="true"
        >
          <div className="lg:ml-1">{children}</div>
        </div>
      </div>
    </div>
  </nav>
);
