export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fr-container flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 mb-12">
      {children}
    </div>
  );
}
