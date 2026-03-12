"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useCandidates } from "./candidates.hook";

export default function CandidatesPage() {
  const { candidate } = useCandidates();

  const router = useRouter();

  useEffect(() => {
    if (candidate?.id) {
      router.push(`./${candidate.id}/candidacies`);
    }
  }, [candidate?.id, router]);

  return <LoaderWithLayout />;
}
