// @ts-check
const rootConfig = require("../../eslint.config.js");
const { defineConfig } = require("eslint/config");
const angular = require("angular-eslint");

module.exports = defineConfig([
  ...rootConfig,
  { ignores: ['!**/*'] },
  {
    files: ["**/*.ts"],
    extends: [
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": "off",
      "@angular-eslint/component-selector": [
        "error",
        {
          "type": "element",
          "prefix": "app",
          "style": "kebab-case"
        }
      ],
      "@angular-eslint/no-input-rename": "off",
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);
