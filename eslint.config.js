// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require('angular-eslint');

module.exports = defineConfig([
  { ignores: ["projects/**/*"] },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
    ],
    rules: {
      "quotes": ["warn", "single"],
    }
  }
]);
