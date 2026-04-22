"use client";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth";

import { GestionnaireMaisonMereAAPUserAccount } from "../_components/gestionnaire-maison-mere-aap-user-account/GestionnaireMaisonMereAAPUserAccount";

const UpdateUserAccountPage = () => {
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();

  const { "maison-mere-id": maisonMereAAPId, userAccountId } = useParams<{
    "maison-mere-id": string;
    userAccountId: string;
  }>();

  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  return isGestionnaireMaisonMereAAP || isAdmin ? (
    <GestionnaireMaisonMereAAPUserAccount
      maisonMereAAPId={maisonMereAAPId}
      userAccountId={userAccountId}
      backUrl={backUrl}
    />
  ) : null;
};
export default UpdateUserAccountPage;
