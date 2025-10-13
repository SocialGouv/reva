import { redirect } from "next/navigation";

import { getAccessTokenFromCookie } from "@/helpers/auth/get-access-token-from-cookie/getAccessTokenFromCookie";
import { throwUrqlErrors } from "@/helpers/graphql/throw-urql-errors/throwUrqlErrors";
import { client } from "@/helpers/graphql/urql-client/urqlClient";

import { graphql } from "@/graphql/generated";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ commanditaireId: string }>;
}) {
  const accessToken = await getAccessTokenFromCookie();
  const { commanditaireId } = await params;

  if (!accessToken) {
    redirect("/login");
  }

  const result = throwUrqlErrors(
    await client.query(
      graphql(`
        query commanditaireVaeCollectiveForDashboardPage(
          $commanditaireVaeCollectiveId: ID!
        ) {
          vaeCollective_getCommanditaireVaeCollective(
            commanditaireVaeCollectiveId: $commanditaireVaeCollectiveId
          ) {
            metabaseDashboardIframeUrl
          }
        }
      `),
      {
        commanditaireVaeCollectiveId: commanditaireId,
      },
      {
        fetchOptions: { headers: { Authorization: `Bearer ${accessToken}` } },
      },
    ),
  );

  const metabaseDashboardIframeUrl =
    result.data?.vaeCollective_getCommanditaireVaeCollective
      ?.metabaseDashboardIframeUrl;

  if (!metabaseDashboardIframeUrl) {
    return null;
  }

  return (
    <iframe src={metabaseDashboardIframeUrl} className="w-full h-screen" />
  );
}
