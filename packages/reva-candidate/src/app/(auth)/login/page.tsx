"use client";

import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { FranceConnectButton } from "@codegouvfr/react-dsfr/FranceConnectButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getFranceConnectLoginUrl } from "@/components/auth/keycloak-france-connect.utils";
import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useAnonymousFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { errorToast, GraphQLError } from "@/components/toast/toast";

import { CredentialsStep } from "./_components/CredentialsStep";
import { OtpStep } from "./_components/OtpStep";
import { useLogin } from "./login.hooks";

type Step = "credentials" | "otp";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState<string>("");
  const [otpChallengeToken, setOtpChallengeToken] = useState<string | null>(
    null,
  );
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [showPasswordResetNotice, setShowPasswordResetNotice] =
    useState<boolean>(false);
  const passwordResetNoticeHandled = useRef<boolean>(false);

  const { loginWithWithCredentials, verifyOtpChallenge } = useLogin();

  const { resetKeycloakInstance } = useKeycloakContext();
  const { isFeatureActive } = useAnonymousFeatureFlipping();

  const isRegisterWithPasswordEnabled = isFeatureActive(
    "ENABLE_REGISTER_WITH_PASSWORD",
  );

  // Affiche un bandeau "mot de passe modifié" quand l'utilisateur arrive
  // depuis l'écran de reset password avec un TOTP enrollé (auto-login skip
  // côté backend). On nettoie le query param après lecture pour qu'il ne
  // persiste pas si l'user refresh ou copie l'URL.
  useEffect(() => {
    if (passwordResetNoticeHandled.current) return;
    if (searchParams.get("passwordReset") === "1") {
      passwordResetNoticeHandled.current = true;
      setShowPasswordResetNotice(true);
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router]);

  const isPending =
    loginWithWithCredentials.isPending || verifyOtpChallenge.isPending;

  const submitCredentials = async (password: string) => {
    try {
      const response = await loginWithWithCredentials.mutateAsync({
        email,
        password,
      });
      const {
        tokens,
        requiresOtp,
        otpChallengeToken: challengeToken,
      } = response.candidate_loginWithCredentials;

      if (requiresOtp && challengeToken) {
        setOtpChallengeToken(challengeToken);
        setOtpError(undefined);
        setStep("otp");
        return;
      }

      if (tokens) {
        resetKeycloakInstance(tokens);
      }
    } catch (error) {
      const message = (error as GraphQLError)?.response?.errors?.[0]?.message;
      if (message?.startsWith("Service d'authentification indisponible")) {
        errorToast(message);
        return;
      }
      errorToast("Adresse électronique ou mot de passe incorrect.");
    }
  };

  const submitOtp = async (totp: string) => {
    if (!otpChallengeToken) {
      setStep("credentials");
      return;
    }
    try {
      const response = await verifyOtpChallenge.mutateAsync({
        challengeToken: otpChallengeToken,
        totp,
      });

      const tokens = response.candidate_verifyOtpChallenge.tokens;
      if (tokens) {
        resetKeycloakInstance(tokens);
      }
    } catch (error) {
      const message = (error as GraphQLError)?.response?.errors?.[0]?.message;
      if (
        message === "Session de vérification expirée, veuillez vous reconnecter"
      ) {
        setOtpChallengeToken(null);
        setOtpError(undefined);
        setStep("credentials");
        errorToast(message);
        return;
      }
      if (message?.startsWith("Service d'authentification indisponible")) {
        errorToast(message);
        return;
      }
      setOtpError("Code de vérification incorrect.");
    }
  };

  const cancelOtp = () => {
    setOtpChallengeToken(null);
    setOtpError(undefined);
    setStep("credentials");
  };

  return (
    <div className="flex-1 pb-6">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
        <div className="w-full lg:w-[588px] bg-white shadow-lifted p-6">
          <h1 className="mb-6 text-center">Connexion candidat</h1>

          {showPasswordResetNotice && (
            <Alert
              small
              severity="success"
              className="mb-6"
              description="Mot de passe modifié. Connectez-vous avec votre code de vérification."
            />
          )}

          {step === "credentials" &&
            isFeatureActive("FRANCE_CONNECT_AUTH_FOR_CANDIDATE") && (
              <div className="flex flex-col items-center gap-2 mb-6">
                <p className="text-xs mb-0 text-dsfrGray-500 max-w-96 mx-auto text-center leading-5">
                  FranceConnect est la solution proposée par l'État pour
                  sécuriser et simplifier la connexion à vos services en ligne.
                </p>
                <FranceConnectButton url={getFranceConnectLoginUrl()} />
                <div className="flex flex-row items-center gap-3 mt-2 w-full">
                  <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
                  <span className="text-dsfrGray-700 text-sm font-bold uppercase">
                    ou
                  </span>
                  <div className="flex-1 bg-dsfrGray-200 h-[1px]" />
                </div>
              </div>
            )}

          {step === "credentials" ? (
            <CredentialsStep
              email={email}
              onEmailChange={setEmail}
              isPending={isPending}
              onSubmit={submitCredentials}
            />
          ) : (
            <OtpStep
              isPending={isPending}
              totpError={otpError}
              onSubmit={submitOtp}
              onCancel={cancelOtp}
            />
          )}
        </div>

        {step === "credentials" && (
          <div className="w-full lg:w-[486px] flex flex-col justify-center gap-8 p-10">
            <p className="text-xl font-bold leading-8 mb-0">
              Vous n'avez pas encore de compte ?
            </p>

            {isRegisterWithPasswordEnabled && (
              <div>
                <p className="text-lg leading-7 mb-0">
                  Créez votre compte avec des identifiants :
                </p>
                <Button
                  priority="secondary"
                  className="w-full justify-center mt-4"
                  linkProps={{ href: "/register" }}
                >
                  Créer mon compte
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
