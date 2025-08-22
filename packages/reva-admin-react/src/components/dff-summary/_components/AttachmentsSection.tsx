import { DffAttachment, File } from "@/graphql/generated/graphql";

const AttachmentItem = (file: File) => {
  return (
    <div key={file.previewUrl} className="flex flex-col w-fit">
      <a
        href={file.previewUrl as string}
        download={file.name}
        className="text-dsfr-blue-france-sun-113 mb-1 break-words max-w-sm sm:max-w-md xl:max-w-3xl"
      >
        <span>{file.name}</span>
        <span className="fr-icon-download-line ml-2 fr-icon--sm" />
      </a>
    </div>
  );
};

export default function AttachmentsSection({
  attachments,
  swornStatementFile,
}: {
  attachments: DffAttachment[];
  swornStatementFile?: File | null;
}) {
  return (
    <div className="mb-4">
      <div className="flex">
        <span className="fr-icon-attachment-fill fr-icon--lg mr-2" />
        <h2>Pièces jointes</h2>
      </div>
      {attachments.map((attachment) => AttachmentItem(attachment.file))}
      {swornStatementFile && AttachmentItem(swornStatementFile)}
    </div>
  );
}
