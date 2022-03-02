interface ResultSectionProps<Data> {
  /**
   * Section name
   */
  title: string;
  /**
   * Custom class
   */
  className?: string;
  children: JSX.Element[];
}

export const ResultSection = ({
  children,
  className = "",
  title,
}: ResultSectionProps<any>) => {
  return (
    <section className={`mb-2 py-4 ${className}`}>
      <div className="-mb-1 text-lg text-slate-600">{title}</div>
      {children}
    </section>
  );
};
