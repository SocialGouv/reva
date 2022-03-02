interface ResultSectionProps<Data> {
  /**
   * Section name
   */
  title: string;
  /**
   * Custom class
   */
  className?: string;
  results: Array<Data>;
  renderResult: (item: Data) => Element;
}

export const ResultSection = ({
  className = "",
  title,
  renderResult,
  results,
  ...props
}: ResultSectionProps<any>) => {
  return (
    <section className={`my-4 py-4 ${className}`} {...props}>
      <div>{title}</div>
      {results.map(renderResult)}
    </section>
  );
};
