import { BlocksContent, BlocksRenderer } from "@strapi/blocks-react-renderer";

export const Cgu = ({
  cguHtml,
  chapo,
  updatedAt,
}: {
  cguHtml: string;
  chapo: BlocksContent;
  updatedAt: string;
}) => (
  <>
    <BlocksRenderer
      content={chapo}
      blocks={{
        paragraph: ({ children }) => (
          <p className="text-xl leading-relaxed mb-0">{children}</p>
        ),
      }}
    />
    <hr className="mt-12 mb-6" />
    <div dangerouslySetInnerHTML={{ __html: cguHtml }} />
    <br />
    <p>
      Dernière version des CGU :{" "}
      {new Date(updatedAt).toLocaleDateString("fr-FR")}
    </p>
  </>
);
