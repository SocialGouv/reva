import { Footer } from "@/components/footer/Footer";
import { PublicHeader } from "@/components/public-header/PublicHeader";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main role="main" id="content" className="flex flex-col flex-1">
        <div className="fr-container flex-1 px-1 mt-4 md:mt-8 md:px-6 md:pb-8 fr-grid-row mb-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
