import { defineConfig } from "eslint/config";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  {
    extends: compat.extends(
      "next/core-web-vitals",
      "next/typescript",
      "plugin:prettier/recommended",
    ),

    rules: {
      "react/no-unescaped-entities": "off",

      "import/no-unused-modules": [
        2,
        {
          unusedExports: true,
          ignoreExports: [
            "eslint.config.mjs",
            "**/**.d.ts",
            "**/route.ts",
            "**/page.tsx",
            "**/layout.tsx",
            "**/pages/**/**.ts",
            "**/pages/**/**.tsx",
          ],
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);
