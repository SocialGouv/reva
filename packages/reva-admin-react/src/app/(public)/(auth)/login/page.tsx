"use client";

import Form from "next/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

import { CredentialsStep } from "./_components/CredentialsStep";
import { OtpStep } from "./_components/OtpStep";
import { RegistrationLinks } from "./_components/RegistrationLinks";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authenticated } = useKeycloakContext();
  const redirectAfterAuthUrl = searchParams.get("redirectAfterAuthUrl") || "";

  // Si l'utilisateur est deja authentifie (cookies persistants ou session SSO
  // ramassee par check-sso), on le renvoie sur /post-login qui se charge du
  // routage par role.
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (redirectedRef.current) return;
    if (authenticated) {
      redirectedRef.current = true;
      const target = redirectAfterAuthUrl
        ? `/post-login?redirectAfterAuthUrl=${encodeURIComponent(redirectAfterAuthUrl)}`
        : "/post-login";
      router.replace(target);
    }
  }, [authenticated, redirectAfterAuthUrl, router]);

  // Hard nav obligatoire vers le Route Handler establish-sso : un redirect()
  // Server Action ferait du soft RSC qui n'atteint pas le handler.
  useEffect(() => {
    if (state.redirectTo) {
      window.location.assign(state.redirectTo);
    }
  }, [state.redirectTo]);

  // Evite le flash du formulaire avant que le useEffect ci-dessus ne navigue.
  if (authenticated) return null;

  const isOtpStep = state.step === "otp";

  return (
    <div className="fr-container">
      <h1 className="mb-12">Connexion à votre espace professionnel</h1>
      <div className="flex flex-col items-center lg:flex-row lg:justify-between gap-20 lg:gap-6">
        <div className="flex flex-col w-full basis-1/2 max-w-xl shadow-lifted">
          <Form className="flex flex-col gap-6 p-6" action={action}>
            {isOtpStep ? (
              <OtpStep
                email={state.email ?? ""}
                otpError={state.errors?.otp?.message}
                otpType={state.otpType ?? "authenticator"}
                pending={pending}
              />
            ) : (
              <CredentialsStep
                defaultEmail={state.email ?? ""}
                passwordError={state.errors?.password?.message}
                pending={pending}
              />
            )}

            <input
              type="hidden"
              name="redirectAfterAuthUrl"
              value={redirectAfterAuthUrl}
            />
          </Form>
        </div>
        <RegistrationLinks />
      </div>
    </div>
  );
}
