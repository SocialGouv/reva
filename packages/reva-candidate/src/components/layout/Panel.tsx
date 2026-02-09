export function Panel({
  children,
  narrow = false,
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <div
      className={`bg-white lg:shadow-lifted${narrow ? " max-w-2xl mx-auto" : " fr-grid-row md:mt-8 pt-4 md:pt-4 md:pb-4"}`}
    >
      {children}
    </div>
  );
}
