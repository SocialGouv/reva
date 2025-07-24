"use client";

import { NameBadge } from "@/components/legacy/molecules/NameBadge/NameBadge";
import { PageLayout } from "@/layouts/page.layout";

import Dashboard from "./_components/dashboard/Dashboard";
import { useHome } from "./home.hook";

export default function Home() {
  const { candidate } = useHome();

  return (
    <PageLayout data-test="candidate-dashboard">
      <NameBadge
        as="h2"
        data-test="project-home-fullname"
        firstname={candidate?.firstname}
        lastname={candidate?.lastname}
      />
      <Dashboard />
    </PageLayout>
  );
}
