import { DffAttachment } from "@/graphql/generated/graphql";

const AttachmentItem = (attachment: DffAttachment) => {
  return (
    <div key={attachment.id} className="flex flex-col w-fit">
      <a
        href={attachment.file.previewUrl as string}
        download={attachment.file.name}
        className="text-dsfr-blue-france-sun-113 mb-1"
      >
        <span>{attachment.file.name}</span>
        <span className="fr-icon-download-line ml-2 fr-icon--sm" />
      </a>
      <p>{attachment.file.mimeType}</p>
    </div>
  );
};

export default function AttachmentsSection({
  attachments,
}: {
  attachments: DffAttachment[];
}) {
  return (
    <div>
      <div className="flex">
        <span className="fr-icon-attachment-fill fr-icon--lg mr-2" />
        <h2>Pièces jointes</h2>
      </div>
      {attachments.map(AttachmentItem)}
    </div>
  );
}
