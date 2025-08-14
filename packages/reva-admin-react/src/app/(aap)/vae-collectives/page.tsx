"use client";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { toDate } from "date-fns";
import { useSearchParams } from "next/navigation";

import { CandidacyCard } from "@/components/card/candidacy-card/CandidacyCard";
import { SearchList } from "@/components/search/search-list/SearchList";

import { CandidacyStatusFilter } from "@/graphql/generated/graphql";

import { useVAECollectivesPage } from "./vaeCollectives.hook";

export default function VAECollectivePage() {
  const searchParams = useSearchParams();
  const cohorte_id = searchParams.get("cohorte_id");
  const status = searchParams.get("status") as CandidacyStatusFilter;
  const page = searchParams.get("page") || "1";
  const searchFilter = searchParams.get("search") || "";

  const { cohortes, candidacies } = useVAECollectivesPage({
    cohorteId: cohorte_id,
    status: status,
    page: parseInt(page),
    searchFilter: searchFilter,
  });

  if (!cohortes) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
        <nav
          role="navigation"
          aria-label="Menu latéral"
          className="flex flex-col gap-4"
        >
          <SideMenu
            className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
            align="left"
            burgerMenuButtonText="Candidatures"
            items={cohortes.map((cohorte) => ({
              text: cohorte.nom,
              linkProps: { href: `/vae-collectives` },
              items: [
                {
                  text: "Candidatures actives",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=ACTIVE_HORS_ABANDON&search=${searchFilter}`,
                  },
                },
                {
                  text: "Candidatures en jury",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=JURY_HORS_ABANDON&search=${searchFilter}`,
                  },
                },
                {
                  text: "Candidatures non recevables",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON&search=${searchFilter}`,
                  },
                },
                {
                  text: "Candidatures abandonnées",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=ABANDON&search=${searchFilter}`,
                  },
                },
                {
                  text: "Candidatures réorientées",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=REORIENTEE&search=${searchFilter}`,
                  },
                },
              ],
            }))}
          />
        </nav>
        <div className="mt-3 flex-1">
          <h1>Candidatures VAE collective</h1>
          <p>
            Retrouvez toutes les candidatures en VAE collective en fonction de
            leur état d’avancement.
          </p>

          <SearchList
            searchResultsPage={
              candidacies || {
                rows: [],
                info: { totalRows: 0, totalPages: 0, currentPage: 0 },
              }
            }
            searchFilter={searchFilter}
          >
            {(candidacy) => (
              <CandidacyCard
                key={candidacy.id}
                candidacyId={candidacy.id}
                candidateFirstname={candidacy.candidate?.firstname || ""}
                candidateLastname={candidacy.candidate?.lastname || ""}
                candidateGivenName={candidacy.candidate?.givenName || undefined}
                certificationLabel={
                  candidacy.certification
                    ? `RNCP ${candidacy?.certification.codeRncp} : ${candidacy?.certification?.label}`
                    : undefined
                }
                departmentCode={candidacy.candidate?.department?.code}
                departmentLabel={candidacy.candidate?.department?.label}
                organismLabel={
                  candidacy.organism?.nomPublic || candidacy.organism?.label
                }
                organismModalitateAccompagnement={
                  candidacy.organism?.modaliteAccompagnement
                }
                candidacySentAt={
                  candidacy.candidacyStatuses.some(
                    (s) => s.status === "VALIDATION",
                  )
                    ? toDate(
                        candidacy.candidacyStatuses.find(
                          (s) => s.status === "VALIDATION",
                        )?.createdAt || 0,
                      )
                    : undefined
                }
                fundable={candidacy.financeModule !== "hors_plateforme"}
                vaeCollective={!!candidacy.cohorteVaeCollective}
                vaeCollectiveCommanditaireLabel={
                  candidacy.cohorteVaeCollective?.commanditaireVaeCollective
                    .raisonSociale
                }
                vaeCollectiveCohortLabel={candidacy.cohorteVaeCollective?.nom}
                status={candidacy.status}
                feasibility={candidacy.feasibility}
                jury={candidacy.jury}
                dropout={candidacy.candidacyDropOut}
              />
            )}
          </SearchList>
        </div>
      </div>
    </div>
  );
}
