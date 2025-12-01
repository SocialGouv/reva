import React from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidacyGuard } from "./CandidacyGuard.hook";

export const CandidacyGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isError } = useCandidacyGuard();

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  if (isError) {
    return <p>Vous n'avez pas accès à cette candidature</p>;
  }

  return children;
};
