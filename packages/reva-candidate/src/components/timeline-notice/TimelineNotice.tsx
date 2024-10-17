export const TimelineNotice = ({
  icon,
  text,
  ...rest
}: { icon: string; text: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="flex flex-row gap-4 w-3/5 text-dsfrGray-500 mb-4 italic"
      {...rest}
    >
      <span className={`${icon} my-auto`} />
      <p className="text-sm mb-0 leading-normal">{text}</p>
    </div>
  );
};
