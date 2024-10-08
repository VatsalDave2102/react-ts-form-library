module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "header-min-length": [2, "always", 10],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "chore", "docs", "style", "refactor", "perf", "test"],
    ],
    "body-max-line-length": [2, "always", Infinity],
  },
};
