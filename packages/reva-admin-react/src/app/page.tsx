"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { Button } from "@codegouvfr/react-dsfr/Button";
const candidaciesQuery = graphql(`
  query getCandidacies {
    getCandidacies(limit: 10) {
      rows {
        id
      }
    }
  }
`);

export default function Home() {
  const { activeFeatures } = useFeatureflipping();
  const { data: session } = useSession();
  const { data: candidacies, refetch } = useQuery({
    queryKey: ["candidacies"],
    queryFn: () =>
      request({
        url: GRAPHQL_API_URL,
        document: candidaciesQuery,
        requestHeaders: {
          authorization: `Bearer ${
            (session as Session & { accessToken: string }).accessToken
          }`,
        },
      }),
  });

  return (
    <div className="text-black ml-4 flex flex-col gap-4">
      <div>Active features: {activeFeatures.join(", ")}</div>
      <div>
        Candidacies:
        <Button className="ml-2" onClick={() => refetch()}>
          refetch
        </Button>
      </div>
      <div>
        <div>
          {candidacies?.getCandidacies.rows.map((r) => (
            <div key={r.id}>{r.id}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
