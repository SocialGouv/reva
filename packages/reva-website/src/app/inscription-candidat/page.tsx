"use client";
import request from "graphql-request";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { GRAPHQL_API_URL } from "@/config/config";

import { graphql } from "@/graphql/generated";
import { Certification } from "@/graphql/generated/graphql";

import {
  CandidateFormData,
  CandidateRegistrationForm,
} from "./_components/CandidateRegistrationForm";

const getCertificationQuery = graphql(`
  query getCertification($certificationId: ID!) {
    getCertification(certificationId: $certificationId) {
      id
      label
      codeRncp
      typeDiplome
      isAapAvailable
    }
  }
`);

const askForRegistrationMutation = graphql(`
  mutation candidate_askForRegistration($candidate: CandidateInput!) {
    candidate_askForRegistration(candidate: $candidate)
  }
`);

export default function CandidateRegistrationPage() {
  return (
    <MainLayout>
      <CandidateBackground>
        <Suspense>
          <CandidateRegistrationPageContent />
        </Suspense>
      </CandidateBackground>
    </MainLayout>
  );
}

function CandidateRegistrationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificationId = searchParams?.get("certificationId");

  const [certification, setCertification] = useState<Pick<
    Certification,
    "id" | "label" | "codeRncp" | "typeDiplome" | "isAapAvailable"
  > | null>(null);

  const handleFormSubmit = async (form: CandidateFormData) => {
    await request(GRAPHQL_API_URL, askForRegistrationMutation, {
      candidate: {
        ...form,
        certificationId: certificationId as string,
      },
    });
    router.push("/inscription-candidat/confirmation");
  };

  useEffect(() => {
    const updateCertification = async () => {
      if (certificationId) {
        setCertification(
          (
            await request(GRAPHQL_API_URL, getCertificationQuery, {
              certificationId: certificationId as string,
            })
          ).getCertification,
        );
      } else {
        setCertification(null);
      }
    };
    updateCertification();
  }, [certificationId]);

  return (
    <CandidateRegistrationForm
      certification={certification}
      onSubmit={handleFormSubmit}
    />
  );
}
