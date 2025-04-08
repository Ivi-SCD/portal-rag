export default {
  extends: ["stylelint-config-standard-scss", "stylelint-config-prettier-scss"],
  plugins: ["stylelint-declaration-block-no-ignored-properties"],
  rules: {
    "plugin/declaration-block-no-ignored-properties": true,
    "scss/at-import-partial-extension": "always",
    "selector-class-pattern": null,
    "scss/dollar-variable-pattern": null
  }
};
