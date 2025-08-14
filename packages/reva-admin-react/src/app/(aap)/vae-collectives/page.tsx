"use client";
import { toDate } from "date-fns";
import { useSearchParams } from "next/navigation";

import { CandidacyCard } from "@/components/card/candidacy-card/CandidacyCard";
import { SearchList } from "@/components/search/search-list/SearchList";

import { CandidacyStatusFilter } from "@/graphql/generated/graphql";

import { VaeCollectivesSideMenu } from "./_components/vae-collectives-side-menu/VaeCollectivesSideMenu";
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
        <VaeCollectivesSideMenu
          cohortes={cohortes}
          searchFilter={searchFilter}
          statusFilter={status}
        />
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
