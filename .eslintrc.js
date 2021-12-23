/* eslint-disable no-undef */
module.exports = {
  "extends": ["plugin:@angular-eslint/recommended"],
  "rules": {
    "@angular-eslint/directive-selector": [
      "error",
      { "type": "attribute", "prefix": "app", "style": "camelCase" }
    ],
    "@angular-eslint/component-selector": [
      "error",
      { "type": "element", "prefix": "app", "style": "kebab-case" }
    ]
  },
  "overrides": [
    {
      "files": ["*.ts"],
      "excludedFiles": "*.spec.ts",
      "extends": [
        "airbnb-typescript/base",
        "plugin:prettier/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript"
      ],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "ecmaVersion": 2021,
        "sourceType": "module",
        "project:": "./tsconfig.json"
      },

      "rules": {
        "@angular-eslint/curly": 2,
        "import/prefer-default-export": "off",
        "prettier/prettier": "error",
        "no-unused-vars": "warn",
        "no-console": "off",
        "func-names": "off",
        "import/extensions": "off",
        "@typescript-eslint/lines-between-class-members": "off",
        "no-empty-function": "off",
        "max-classes-per-file": "off",
        "no-underscore-dangle": "off",
        "@typescript-eslint/class-name-casing": "off",
        "no-param-reassign": "off",
        "no-prototype-builtins": "off",
        "no-control-regex": "off",
        "class-methods-use-this": "off",
        "lines-between-class-members": "off",
        "no-empty-lifecycle-method": "off",
        "import/no-unresolved": "off",
        "import/namespace": "off",
      },
      "plugins": ["@angular-eslint/template"],
      "processor": "@angular-eslint/template/extract-inline-html"
    },
  ]
};
