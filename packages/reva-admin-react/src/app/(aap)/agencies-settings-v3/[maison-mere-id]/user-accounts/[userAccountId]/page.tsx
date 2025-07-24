"use client";
import { Suspense } from "react";

import { useAuth } from "@/components/auth/auth";

import CollaborateurUserAccount from "../_components/collaborateur-user-account/CollaborateurUserAccount";
import GestionnaireMaisonMereAAPUserAccount from "../_components/gestionnaire-maison-mere-aap-user-account/GestionnaireMaisonMereAAPUserAccount";

const UpdateUserAccountPage = () => {
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();
  return isGestionnaireMaisonMereAAP || isAdmin ? (
    <GestionnaireMaisonMereAAPUserAccount />
  ) : (
    <Suspense fallback={<p>Chargement...</p>}>
      <CollaborateurUserAccount />
    </Suspense>
  );
};

export default UpdateUserAccountPage;
