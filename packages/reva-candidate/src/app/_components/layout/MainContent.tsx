export const MainContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <main role="main" id="content" className="flex flex-col flex-1">
      {children}
    </main>
  );
};
