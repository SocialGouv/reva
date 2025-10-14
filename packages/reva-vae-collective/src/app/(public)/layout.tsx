import { PublicHeader } from "@/components/public-header/PublicHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicHeader />
      <main role="main" id="content" className="flex flex-col flex-1">
        <div>
          <div
            className={`pt-4 md:pt-8 md:pb-8 fr-grid-row mb-12 fr-container`}
          >
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
