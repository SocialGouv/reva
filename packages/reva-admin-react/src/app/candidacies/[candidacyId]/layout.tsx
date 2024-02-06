"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useQuery } from "@tanstack/react-query";
import { useParams, usePathname } from "next/navigation";
import { ReactNode } from "react";

const getCandidacyQuery = graphql(`
  query getCandidacyWithCandidateInfoForLayout($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        firstname
        lastname
      }
    }
  }
`);

const CandidacyPageLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const { graphqlClient } = useGraphQlClient();

  const { isFeatureActive } = useFeatureflipping();

  const { data: getCandidacyResponse } = useQuery({
    queryKey: ["getCandidacy", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const candidate = getCandidacyResponse?.getCandidacyById?.candidate;
  const menuItem = (text: string, path: string) => ({
    isActive: currentPathname.startsWith(path),
    linkProps: {
      href: path,
      target: "_self",
    },
    text,
  });

  return isFeatureActive("DOSSIER_DE_VALIDATION") ? (
    <div className="flex flex-col flex-1 w-full md:flex-row gap-10 md:gap-0 ">
      <SideMenu
        title={
          <div className="flex items-center pt-1.5">
            <span className="fr-icon-user-fill fr-icon mr-2" />
            <p className="font-bold text-xl capitalize">
              {`${candidate?.firstname || ""} ${
                candidate?.lastname || ""
              }`.toLowerCase()}
            </p>
          </div>
        }
        className="flex-shrink-0 flex-grow-0 md:basis-[300px]"
        align="left"
        burgerMenuButtonText="Candidatures"
        sticky
        fullHeight
        items={[
          menuItem(
            "Étude de faisabilité",
            `/candidacies/${candidacyId}/feasibility`,
          ),
          menuItem(
            "Dossier de validation",
            `/candidacies/${candidacyId}/dossier-de-validation`,
          ),
        ]}
      />
      <div className="mt-3 flex-1">{children}</div>
    </div>
  ) : (
    children
  );
};

export default CandidacyPageLayout;
