module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es6: true,
    node: true
  },
  plugins: ["prettier", "react"],
  extends: ["prettier", "plugin:react/recommended", "eslint:recommended"]
};
