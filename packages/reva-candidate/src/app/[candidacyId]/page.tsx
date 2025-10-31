"use client";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { PageLayout } from "@/layouts/page.layout";

import Dashboard from "../_components/home/dashboard/Dashboard";

import { useCandidate } from "./candidate.hook";

export default function Home() {
  const { candidate } = useCandidate();

  return (
    <PageLayout data-testid="candidate-dashboard">
      <NameBadge
        as="h2"
        data-testid="project-home-fullname"
        firstname={candidate?.firstname}
        lastname={candidate?.lastname}
      />
      <Dashboard />
    </PageLayout>
  );
}
