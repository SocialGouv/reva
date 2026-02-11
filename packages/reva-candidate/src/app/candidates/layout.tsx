export default function CandidatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 lg:bg-candidate">
      <div className="flex flex-col flex-1">
        <div className="fr-container !px-0 flex-1 mt-8 mb-8">{children}</div>
      </div>
    </div>
  );
}
