export const ContentSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mb-10 pl-3">
    <SectionHeader>{title}</SectionHeader>
    {children}
  </section>
);

export const MainTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h1
    className={`pl-3 py-8 my-8 text-[20px] md:text-[32px] xl:text-[48px] font-extrabold ${className}`}
  >
    {children}
  </h1>
);

export const SectionHeader = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <h2 className={`text-[16px] md:text-[20px] xl:text-[36px] my-9 ${className}`}>
    {children}
  </h2>
);

export const SectionParagraph = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <p className={`text-base md:text-xl xl:text-2xl pb-8 leading-8 ${className}`}>{children}</p>
);

