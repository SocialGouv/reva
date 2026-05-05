"use client";

import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

export const StrapiBlocksRenderer = ({
  content,
}: {
  content: BlocksContent;
}) => {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        paragraph: ({ children }) => (
          <p className="text-xl leading-relaxed mb-0">{children}</p>
        ),
      }}
    />
  );
};
