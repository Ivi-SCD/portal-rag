export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix"]],
    "subject-case": [2, "always", ["lower-case"]]
  }
};
