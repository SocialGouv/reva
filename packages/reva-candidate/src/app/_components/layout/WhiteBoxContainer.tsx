export function WhiteBoxContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`fr-container lg:shadow-lifted flex-1 md:mt-8 px-1 pt-4 md:px-6 md:pt-6 md:pb-8 fr-grid-row bg-white mb-12`}
    >
      {children}
    </div>
  );
}
