"use client";
import { useAuth } from "@/components/auth/auth";
import { Suspense } from "react";
import AgencyUserAccount from "../_components/agency-user-account/AgencyUserAccount";
import HeadAgencyUserAccount from "../_components/head-agency-user-account/HeadAgencyUserAccount";

const UpdateUserAccountPage = () => {
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();
  return isGestionnaireMaisonMereAAP || isAdmin ? (
    <HeadAgencyUserAccount />
  ) : (
    <Suspense fallback={<p>Chargement...</p>}>
      <AgencyUserAccount />
    </Suspense>
  );
};

export default UpdateUserAccountPage;
