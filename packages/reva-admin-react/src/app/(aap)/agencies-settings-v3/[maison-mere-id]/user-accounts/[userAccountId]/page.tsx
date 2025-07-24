"use client";
import { Suspense } from "react";

import CollaborateurUserAccount from "../_components/collaborateur-user-account/CollaborateurUserAccount";
import GestionnaireMaisonMereAAPUserAccount from "../_components/gestionnaire-maison-mere-aap-user-account/GestionnaireMaisonMereAAPUserAccount";

import { useAuth } from "@/components/auth/auth";

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
