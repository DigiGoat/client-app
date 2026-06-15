// @ts-check
const rootConfig = require("../../eslint.config.js");
const { defineConfig } = require("eslint/config");
const angular = require("angular-eslint");

module.exports = defineConfig([
  ...rootConfig,
  { ignores: ['!**/*', 'webpack.config.js'] },
  {
    files: ["**/*.ts"], rules: {

    }
  },
]);
