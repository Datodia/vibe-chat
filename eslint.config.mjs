import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
    "public/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-len": [
        "error",
        {
          code: 160,
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "max-depth": ["error", 3],
      "eol-last": ["error", "always"],
      "@typescript-eslint/no-unused-expressions": "error",
      "quotes": ["error", "single", { "avoidEscape": true }],
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "tests/**", "e2e/**"],
    rules: {
      "max-lines": "off",
      "max-len": "off",
    },
  },
  {
    files: ['**/mongo.{ts,tsx}', '**/redis.{ts,tsx}', '**/catch-async.{ts,tsx}'],
    rules: {
      "no-console": "off",
    }
  }
]);

export default eslintConfig;
