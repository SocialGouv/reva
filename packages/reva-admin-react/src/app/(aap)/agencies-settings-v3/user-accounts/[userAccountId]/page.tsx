"use client";
import { useAuth } from "@/components/auth/auth";
import HeadAgencyUserAccount from "../_components/head-agency-user-account/HeadAgencyUserAccount";
import AgencyUserAccount from "../_components/agency-user-account/AgencyUserAccount";

const UpdateUserAccountPage = () => {
  const { isGestionnaireMaisonMereAAP } = useAuth();
  return isGestionnaireMaisonMereAAP ? (
    <HeadAgencyUserAccount />
  ) : (
    <AgencyUserAccount />
  );
};

export default UpdateUserAccountPage;
