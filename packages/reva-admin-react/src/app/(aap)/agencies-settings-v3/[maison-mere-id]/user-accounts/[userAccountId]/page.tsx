"use client";
import { useAuth } from "@/components/auth/auth";
import { Suspense } from "react";
import AgencyUserAccount from "../_components/agency-user-account/AgencyUserAccount";
import GestionnaireMaisonMereAAPUserAccount from "../_components/gestionnaire-maison-mere-aap-user-account/GestionnaireMaisonMereAAPUserAccount";

const UpdateUserAccountPage = () => {
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();
  return isGestionnaireMaisonMereAAP || isAdmin ? (
    <GestionnaireMaisonMereAAPUserAccount />
  ) : (
    <Suspense fallback={<p>Chargement...</p>}>
      <AgencyUserAccount />
    </Suspense>
  );
};

export default UpdateUserAccountPage;
