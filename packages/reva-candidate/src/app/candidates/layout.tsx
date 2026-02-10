export default function CandidatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 lg:bg-candidate">
      <div className="flex flex-col flex-1">
        <div className="fr-container flex-1 mb-12 md:mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
