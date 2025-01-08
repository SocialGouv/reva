"use client";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";

const getCandidacyQuery = graphql(`
  query getCandidacyWithCandidateInfoForLayout($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      typeAccompagnement
      candidate {
        firstname
        lastname
      }
      jury {
        dateOfSession
      }
      candidacyContestationsCaducite {
        certificationAuthorityContestationDecision
      }
      isCaduque
    }
  }
`);

const CandidacyPageLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyResponse } = useQuery({
    queryKey: [candidacyId, "getCandidacyQuery"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const candidacy = getCandidacyResponse?.getCandidacyById;
  const candidate = candidacy?.candidate;
  const juryDateOfSession = candidacy?.jury?.dateOfSession;
  const typeAccompagnement = candidacy?.typeAccompagnement;
  const isCaduque = candidacy?.isCaduque;
  const hasPendingCaduciteContestation =
    candidacy?.candidacyContestationsCaducite?.some(
      (caducite) =>
        caducite?.certificationAuthorityContestationDecision ===
        "DECISION_PENDING",
    );

  const menuItem = (text: string | ReactNode, path: string) => ({
    isActive: currentPathname.startsWith(path),
    linkProps: {
      href: path,
      target: "_self",
    },
    text,
  });

  const items = [
    menuItem("Étude de faisabilité", `/candidacies/${candidacyId}/feasibility`),
    menuItem(
      "Dossier de validation",
      `/candidacies/${candidacyId}/dossier-de-validation`,
    ),
    menuItem("Jury", `/candidacies/${candidacyId}/jury`),
  ];

  if (!juryDateOfSession) {
    items.push(
      menuItem(
        <Button size="small" priority="secondary" className="m-auto my-3">
          Transférer la candidature
        </Button>,
        `/candidacies/${candidacyId}/transfer?page=1`,
      ),
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full md:flex-row gap-10 md:gap-0 ">
      <SideMenu
        title={
          <>
            <div className="flex items-center pt-1.5 mb-4">
              <span className="fr-icon-user-fill fr-icon mr-2" />
              <p className="font-bold text-xl capitalize">
                {`${candidate?.firstname || ""} ${
                  candidate?.lastname || ""
                }`.toLowerCase()}
              </p>
            </div>
            {typeAccompagnement === "AUTONOME" && (
              <Badge severity="new" className="mt-4">
                Candidat en autonomie
              </Badge>
            )}
            {isCaduque && !hasPendingCaduciteContestation && (
              <Badge severity="error" className="mt-4">
                Recevabilité caduque
              </Badge>
            )}
            {hasPendingCaduciteContestation && (
              <Badge severity="warning" className="mt-4">
                Contestation caducité
              </Badge>
            )}
          </>
        }
        className="flex-shrink-0 flex-grow-0 md:basis-[300px]"
        align="left"
        burgerMenuButtonText="Candidatures"
        sticky
        fullHeight
        items={items}
      />
      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
};

export default CandidacyPageLayout;
