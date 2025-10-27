"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

export default function CandidatesPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("./candidacies");
  }, [router]);

  return <LoaderWithLayout />;
}
