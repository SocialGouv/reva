import Tile from "@codegouvfr/react-dsfr/Tile";
import { format } from "date-fns";

type JuryType = {
  id: string;
  dateOfSession: number;
  timeSpecified?: boolean | null;
  timeOfSession?: string | null;
  addressOfSession?: string | null;
  informationOfSession?: string | null;
};

interface Props {
  jury: JuryType;
  candidacy: {
    certificationAuthorityLocalAccounts?:
      | ({
          contactFullName: string;
        } | null)[]
      | null;
    certificationAuthority?: {
      label: string;
    } | null;
  };
}

export const DateDeJuryCard = (props: Props) => {
  const { jury, candidacy } = props;

  return (
    <div className="flex flex-col">
      <Tile
        title={`${format(jury.dateOfSession, "dd/MM/yyyy")}${jury.timeOfSession ? ` - ${jury.timeOfSession}` : ""}`}
        small
        className="w-1/3 mb-6"
      />
      <div className="flex flex-row border-t py-4 px-4 gap-6">
        <dt className="min-w-40">Programmé par :</dt>
        <dd className="font-bold">
          {candidacy?.certificationAuthorityLocalAccounts?.[0]
            ?.contactFullName ||
            candidacy?.certificationAuthority?.label ||
            "Non renseigné"}
        </dd>
      </div>
      <div className="flex flex-row border-t py-4 px-4 gap-6">
        <dt className="min-w-40 ">Lieu :</dt>
        <dd className="font-bold">
          {jury.addressOfSession || "Non renseigné"}
        </dd>
      </div>
      <div className="flex flex-row border-y py-4 px-4 gap-6">
        <dt className="min-w-40 ">Information complémentaire :</dt>
        <dd className="font-bold">
          {jury.informationOfSession || "Non renseigné"}
        </dd>
      </div>
    </div>
  );
};
