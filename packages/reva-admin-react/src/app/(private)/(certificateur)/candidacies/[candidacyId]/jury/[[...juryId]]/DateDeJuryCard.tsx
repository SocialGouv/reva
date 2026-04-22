import { format } from "date-fns";

import { FancyPreview } from "@/components/fancy-preview/FancyPreview";

type FileType = { url: string; previewUrl?: string | null; name: string };

type JuryType = {
  id: string;
  dateOfSession: number;
  timeSpecified?: boolean | null;
  addressOfSession?: string | null;
  informationOfSession?: string | null;
  convocationFile?: FileType | null;
};

interface Props {
  jury: JuryType;
}

export const DateDeJuryCard = (props: Props) => {
  const { jury } = props;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-y-8 gap-x-28">
        <div>
          <dt className="font-bold">Date :</dt>
          <dd>
            {jury.dateOfSession && format(jury.dateOfSession, "dd MMMM yyyy")}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Heure de convocation :</dt>
          <dd>
            {jury.timeSpecified
              ? format(jury.dateOfSession, "HH:mm")
              : "Non renseigné"}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Lieu :</dt>
          <dd>{jury.addressOfSession || "Non renseigné"}</dd>
        </div>
      </div>
      <p>
        <dt className="font-bold">
          Information complémentaire liée à la session :
        </dt>
        <dd>{jury.informationOfSession || "Non renseigné"}</dd>
      </p>

      {jury.convocationFile?.previewUrl && (
        <FancyPreview
          key={jury.convocationFile.url}
          defaultDisplay={false}
          name={jury.convocationFile.name}
          src={jury.convocationFile.previewUrl}
          title={jury.convocationFile.name}
        />
      )}
    </div>
  );
};
