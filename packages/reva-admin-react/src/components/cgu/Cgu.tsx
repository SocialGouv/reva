"use client";
import { BlocksContent, BlocksRenderer } from "@strapi/blocks-react-renderer";
import { toDate } from "date-fns";

export const Cgu = ({
  cguHtml,
  chapo,
  updatedAt,
}: {
  cguHtml: string;
  chapo: BlocksContent;
  updatedAt: string;
}) => (
  <div data-testid="cgu">
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
      Dernière version des CGU : {toDate(updatedAt).toLocaleDateString("fr-FR")}
    </p>
  </div>
);
