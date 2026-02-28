// @ts-check
import { dirname } from "path";
import { fileURLToPath } from "url";

import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettierPluginRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettierPluginRecommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["app/**/*.ts", "app/**/*.tsx", "*.ts", "*.tsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      globals: { ...globals.node },
    },
  },
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
    },
  },
);
