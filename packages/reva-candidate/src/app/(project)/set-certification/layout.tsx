import { PageLayout } from "@/layouts/page.layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout
      title="Choix du diplôme"
      data-test={`certificates`}
      displayBackToHome
    >
      {children}
    </PageLayout>
  );
}
