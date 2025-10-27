import React from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidateGuard } from "./CandidateGuard.hook";

export const CandidateGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isError } = useCandidateGuard();

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (isError) {
    return <div>Vous n'avez pas accès à ce candidat</div>;
  }

  return children;
};
