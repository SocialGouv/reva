export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fr-container flex-1 mt-8 mb-8">{children}</div>;
}
