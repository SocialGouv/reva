"use client";
import { Card } from "@/components/legacy/organisms/Card";
import { searchCertifications } from "../set-certification.loaders";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CertificationResultCard ({ rows }: {
  rows: Awaited<ReturnType<typeof searchCertifications>>["rows"]
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  return (
    rows?.map((certification) => (
      <Card
        key={certification.id}
        id={certification.id}
        title={certification.label}
        codeRncp={certification.codeRncp}
        onClick={() => {
          const queryParams = new URLSearchParams(searchParams);
          queryParams.set("certificationId", certification.id);
          const path = `${pathname}?${queryParams.toString()}`;
          router.push(path);
        }}
      />
    ))
  )
}