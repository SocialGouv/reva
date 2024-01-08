"use client";
import { useFeasibilityPageLogic } from "@/app/feasibilities/[feasibilityId]/feasibilityPageLogic";
import { AuthenticatedLink } from "@/components/authenticated-link/AuthenticatedLink";
import Link from "next/link";

const FeasibilityPage = () => {
  const { feasibility } = useFeasibilityPageLogic();
  return (
    <div className="flex flex-col flex-1">
      <Link
        href="/feasibilities?CATEGORY=ALL"
        className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
      >
        Tous les dossiers
      </Link>
      {feasibility && (
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold mt-8">
            {feasibility.candidacy.candidate?.firstname}{" "}
            {feasibility.candidacy.candidate?.lastname}
          </h1>
          <p className="text-2xl font-bold">
            {feasibility.candidacy.certification?.label}
          </p>
          {feasibility.feasibilityFile && (
            <FileLink
              text={feasibility.feasibilityFile.name}
              url={feasibility.feasibilityFile.url}
            />
          )}
          {feasibility.documentaryProofFile && (
            <FileLink
              text={feasibility.documentaryProofFile.name}
              url={feasibility.documentaryProofFile.url}
            />
          )}
          {feasibility.certificateOfAttendanceFile && (
            <FileLink
              text={feasibility.certificateOfAttendanceFile.name}
              url={feasibility.certificateOfAttendanceFile.url}
            />
          )}
          <div className="bg-neutral-100 px-8 pt-6 pb-8 w-full">
            <h5 className="text-2xl font-bold mb-4">
              Architecte accompagnateur de parcours
            </h5>
            <h6 className="text-xl font-bold mb-4">
              {feasibility.candidacy.organism?.label}
            </h6>
            <p className="text-lg mb-0">
              {feasibility.candidacy.organism?.contactAdministrativeEmail}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeasibilityPage;

const FileLink = ({ url, text }: { url: string; text: string }) => (
  <div className="bg-gray-100 px-8 pt-6 pb-8 border">
    <AuthenticatedLink
      text={text}
      title={text}
      url={url}
      className="fr-link text-2xl font-semibold"
    />
  </div>
);
