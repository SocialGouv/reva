"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidates } from "./candidates.hook";

export default function CandidatesPage() {
  const { candidate } = useCandidates();

  const router = useRouter();

  const { candidateId } = useParams<{
    candidateId: string;
  }>();

  useEffect(() => {
    if (!candidateId && candidate?.id) {
      router.push(`./${candidate.id}`);
      return;
    }
  }, [candidateId, candidate?.id, router]);

  return <LoaderWithLayout />;
}
