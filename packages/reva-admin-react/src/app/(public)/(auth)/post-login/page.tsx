import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { POST_LOGIN_TOKENS_COOKIE } from "../_lib/post-login-cookie";

import PostLoginClient from "./_components/PostLoginClient";

import type { Tokens } from "@/components/auth/keycloak.utils";

const PostLoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirectAfterAuthUrl?: string }>;
}) => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(POST_LOGIN_TOKENS_COOKIE)?.value;

  if (!cookieValue) {
    redirect("/login");
  }

  // Pas de cookieStore.delete() : interdit en server component (Next 15.5+).
  // Le passer via server action declenche une revalidation qui re-execute
  // ce composant sans le cookie -> redirect /login. maxAge sur le cookie suffit.

  let tokens: Tokens;
  try {
    tokens = JSON.parse(cookieValue);
  } catch {
    redirect("/login");
  }

  const { redirectAfterAuthUrl } = await searchParams;

  return (
    <PostLoginClient
      tokens={tokens}
      redirectAfterAuthUrl={redirectAfterAuthUrl}
    />
  );
};

export default PostLoginPage;
