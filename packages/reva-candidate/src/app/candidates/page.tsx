"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidates } from "./candidates.hook";

export default function CandidatesPage() {
  const { candidate } = useCandidates();

  const router = useRouter();

  useEffect(() => {
    if (candidate?.id) {
      if (candidate.profileInformationCompleted) {
        router.push(`./${candidate.id}/candidacies`);
      } else {
        router.push(`./${candidate.id}/first-connexion`);
      }
    }
  }, [candidate?.id, candidate?.profileInformationCompleted, router]);

  return <LoaderWithLayout />;
}
