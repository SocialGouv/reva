import { dirname } from "path";
import { fileURLToPath } from "url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.json"],
        },
      },
    },
    extends: fixupConfigRules(
      compat.extends(
        "next/core-web-vitals",
        "next/typescript",
        "plugin:prettier/recommended",
      ),
    ),

    plugins: {
      import: fixupPluginRules(importPlugin),
    },

    rules: {
      "react/no-unescaped-entities": "off",
      "import/no-unused-modules": [
        2,
        {
          unusedExports: true,
          ignoreExports: [
            "eslint.config.mjs",
            "**/**.d.ts",
            "**/page.tsx",
            "**/layout.tsx",
            "codegen.ts",
            "cypress.config.ts",
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

      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  {
    files: ["*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
