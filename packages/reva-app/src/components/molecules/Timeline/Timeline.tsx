export const Timeline = ({
  className,
  children,
  dataTest,
}: {
  className?: string;
  children?: React.ReactNode;
  dataTest?: string;
}) => {
  return (
    <div className={`flex flex-col ${className}`} data-test={dataTest}>
      <div className="w-4 h-2 bg-dsfrBlue-500 rounded-t-full top-[2px] relative" />
      {children}
      <div className="w-4 h-3 bg-dsfrBlue-500 rounded-b-full" />
    </div>
  );
};

export const TimelineElement = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) => (
  <section className="relative flex gap-3">
    <BlueBarWithWhiteDot />
    <div className="flex flex-col top-[-7.5px] relative">
      <h2 className="text-black mb-4 !leading-none">{title}</h2>

      {description ? (
        <p className="text-sm text-dsfrGray-500 mb-2">{description}</p>
      ) : null}

      <div className="flex flex-col text-sm text-black pb-6 ">{children}</div>
    </div>
  </section>
);

const BlueBarWithWhiteDot = () => (
  <>
    <div className="relative flex-shrink-0 w-4 bg-dsfrBlue-500 top-0.5" />
    <div className="absolute w-3 h-3 rounded-full left-0.5 top-[-4px] bg-white" />
  </>
);
