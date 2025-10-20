"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { SearchFilterBar } from "@/components/search-filter-bar/SearchFilterBar";

type PrcList = ({
  documentId: string;
  nom: string;
  email: string;
  adresse: string;
  mandataire?: string | null;
  region?: string | null;
  telephone?: string | null;
  departement?: {
    __typename?: "Departement";
    nom: string;
    code: string;
  } | null;
} | null)[];

const ListComponent = ({ prcs }: { prcs: PrcList }) => {
  const searchParams = useSearchParams();
  const searchFilter = searchParams?.get("search") || "";
  const displayedPrcs = useMemo(() => {
    if (searchFilter) {
      const subFilter = searchFilter.substring(0, 2);
      return prcs?.filter((prc) =>
        prc?.departement?.code?.startsWith(subFilter),
      );
    } else {
      return prcs;
    }
  }, [searchFilter, prcs]);
  return (
    <>
      <div className="py-8 px-10 shadow-lifted mb-12 border-b-fvaeOrange border-b-4">
        <p className="text-[32px] font-bold">
          Recherchez un conseiller proche de chez vous
        </p>
        <SearchFilterBar
          big
          placeholder="Votre code postal"
          searchFilter={searchFilter}
          resultCount={displayedPrcs.length}
          onSearchFilterChange={(filter) => {
            const queryParams = new URLSearchParams(searchParams || "");
            if (filter) {
              queryParams.set("search", filter);
            } else {
              queryParams.delete("search");
            }

            // Use native pushState to avoid re-rendering the server-component and refetching from Strapi the PRC list we already have
            window.history.pushState(null, "", `?${queryParams.toString()}`);
          }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPrcs?.map((prc) => (
          <div key={prc?.documentId} className="flex flex-col border p-6 gap-2">
            <h1 className="text-2xl font-bold mb-4">{prc?.nom}</h1>
            <div>
              <span
                className="fr-icon-home-4-line fr-icon--sm mr-2"
                aria-hidden="true"
                aria-label="Adresse"
                title="Adresse"
              ></span>
              {prc?.adresse}
              <br />
              {prc?.departement?.nom} ({prc?.departement?.code})
            </div>
            <div>
              <span
                className="fr-icon-mail-line fr-icon--sm mr-2"
                aria-hidden="true"
                aria-label="Adresse électronique"
                title="Adresse électronique"
              ></span>
              {prc?.email}
            </div>
            {prc?.mandataire && (
              <div>
                <span
                  className="fr-icon-team-line fr-icon--sm mr-2"
                  aria-hidden="true"
                  aria-label="Mandataire"
                  title="Mandataire"
                ></span>
                {prc?.mandataire}
              </div>
            )}
            <div>
              <span
                className="fr-icon-phone-line fr-icon--sm mr-2"
                aria-hidden="true"
                aria-label="Téléphone"
                title="Téléphone"
              ></span>
              {prc?.telephone}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export const PrcList = ({ prcs }: { prcs: PrcList }) => {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ListComponent prcs={prcs} />
    </Suspense>
  );
};
