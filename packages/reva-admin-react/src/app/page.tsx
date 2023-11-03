"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useSession } from "next-auth/react";

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

  const { data: candidacies } = useQuery({
    queryKey: ["candidacies"],
    queryFn: () =>
      request({
        url: GRAPHQL_API_URL,
        document: candidaciesQuery,
        requestHeaders: {
          authorization: `Bearer ${(session as any).access_token}`,
        },
      }),
  });

  console.log({ session });

  return (
    <div className="text-white ml-4 flex flex-col">
      <div>Active features: {activeFeatures.join(", ")}</div>
      <div>
        Candidacies:
        <div>
          {candidacies?.getCandidacies.rows.map((r) => (
            <div key={r.id}>{r.id}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
