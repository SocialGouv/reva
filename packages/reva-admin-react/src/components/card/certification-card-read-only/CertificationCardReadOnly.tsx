import Image from "next/image";

export const CertificationCardReadOnly = ({
  certification,
}: {
  certification?: {
    id: string;
    codeRncp: string;
    label: string;
  } | null;
  newTab?: boolean;
}) => {
  if (!certification) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-6 border border-dsfr-light-border-default w-full">
      <div className="flex flex-row gap-2">
        <Image
          src="/admin2/components/verified-badge.svg"
          alt="Verified badge icon"
          width={16}
          height={16}
        />
        <p className="text-xs text-dsfr-light-text-mention-grey mb-0">
          RNCP {certification?.codeRncp}
        </p>
      </div>

      <p className="text-xl font-bold mb-0 ">{certification?.label}</p>
    </div>
  );
};
