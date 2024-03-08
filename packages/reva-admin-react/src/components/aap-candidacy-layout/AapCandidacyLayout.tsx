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
      label
      url
      status
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
  const menuEntries = getCandidacyMenuResponse?.candidacyMenu_getCandidacyMenu;

  return (
    <div className="flex flex-col lg:flex-row">
      <CandidacyLayoutSideMenu>
        {menuEntries?.map((e) => (
          <li key={e.label} className="mt-5 mb-7 text-sm">
            {e.status === "INACTIVE" && <span>{e.label}</span>}
            {e.status === "ACTIVE_WITHOUT_HINT" && (
              <a className="bg-none" href={e.url}>
                {e.label}
              </a>
            )}

            {e.status === "ACTIVE_WITH_EDIT_HINT" && (
              <a href={e.url}>
                <div className="flex flex-col gap-2">
                  <span className="text-dsfr-blue-france-sun-113 font-bold">
                    {e.label}
                  </span>
                  <Button className="mt-1">Compléter</Button>
                </div>
              </a>
            )}
          </li>
        ))}
      </CandidacyLayoutSideMenu>
      {children}
    </div>
  );
};

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
          <div className="lg:ml-1">
            <h1 className="mt-0.5 flex items-end text-xl font-semibold">
              Toutes les étapes
            </h1>
            <ul>{children}</ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
);
