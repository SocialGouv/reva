export const Timeline = ({
  className,
  children,
  "data-test": dataTest,
}: {
  className?: string;
  children?: React.ReactNode;
  "data-test"?: string;
}) => {
  return (
    <div className={`relative flex flex-col ${className}`} data-test={dataTest}>
      {children}
    </div>
  );
};

type TimeLineElementStatus = "editable" | "disabled" | "active" | "readonly";
export const TimelineElement = ({
  title,
  description,
  status,
  children,
  className,
}: {
  title: string;
  description?: string;
  status: TimeLineElementStatus;
  children?: (args: { status: TimeLineElementStatus }) => React.ReactNode;
  className?: string;
}) => (
  <section className={`relative flex gap-3 h-full ${className}`}>
    <BarWithWhiteDot status={status} />
    <div
      className={`flex flex-col relative bottom-0.5 ${
        status === "disabled" ? "opacity-40" : ""
      }
`}
    >
      <h3 className="text-black !leading-none">{title}</h3>

      {description ? (
        <p className="text-sm text-dsfrGray-500 mt-4">{description}</p>
      ) : null}

      {children && (
        <div
          className={`flex flex-col text-sm text-black pb-6 ${
            description ? "mt-2" : "mt-4"
          }`}
        >
          {children?.({ status })}
        </div>
      )}
    </div>
  </section>
);

const BarWithWhiteDot = ({ status }: { status: TimeLineElementStatus }) => (
  <div className="flex flex-col justify-self-stretch">
    {/*Blue bar*/}
    <div
      className={`relative flex-shrink-0 w-4 ${
        ["editable", "readonly"].includes(status)
          ? "bg-dsfrBlue-500"
          : "bg-[#D9D9D9]"
      } top-2 h-[calc(100%+8px)] rounded-b-full`}
    />

    {/*White dot*/}
    <div
      className={`absolute w-4 h-4 rounded-full ${
        status === "disabled" ? "bg-[#D9D9D9]" : "bg-dsfrBlue-500"
      }`}
    >
      <div className="absolute w-3 h-3 rounded-full left-0.5 top-0.5 bg-white " />
    </div>
  </div>
);
