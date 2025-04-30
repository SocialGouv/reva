"use client";

import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { RootNode } from "@strapi/blocks-react-renderer/dist/BlocksRenderer";

export const StrapiBlocksRenderer = ({ content }: { content: RootNode[] }) => {
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
