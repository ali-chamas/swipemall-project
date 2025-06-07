module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": "warn",
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "warn",
  },
  env: {
    node: true,
  },
};
