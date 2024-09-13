"use client";
import { useAuth } from "@/components/auth/auth";
import HeadAgencyUserAccount from "../_components/head-agency-user-account/HeadAgencyUserAccount";
import AgencyUserAccount from "../_components/agency-user-account/AgencyUserAccount";
import { Suspense } from "react";

const UpdateUserAccountPage = () => {
  const { isGestionnaireMaisonMereAAP } = useAuth();
  return isGestionnaireMaisonMereAAP ? (
    <HeadAgencyUserAccount />
  ) : (
    <Suspense fallback={<p>Chargement...</p>}>
      <AgencyUserAccount />
    </Suspense>
  );
};

export default UpdateUserAccountPage;
