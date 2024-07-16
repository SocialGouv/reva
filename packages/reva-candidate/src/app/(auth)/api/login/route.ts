import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { graphql } from "@/graphql/generated";
import { getGraphQlClient } from "@/utils/graphql-client-server";

export const dynamic = "force-dynamic"; // defaults to auto

const CANDIDATE_LOGIN = graphql(`
  mutation candidate_login($token: String!) {
    candidate_login(token: $token) {
      tokens {
        accessToken
        refreshToken
        idToken
      }
    }
  }
`);

export async function GET(request: Request) {
  const cookieStore = cookies();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    redirect("/candidat/login");
  }
  const graphqlClient = getGraphQlClient();

  const res = await graphqlClient.request(CANDIDATE_LOGIN, { token });
  cookieStore.set("tokens", JSON.stringify(res.candidate_login.tokens));
  redirect("/candidat/");
}
