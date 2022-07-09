module.exports = (directory) => ({
  root: true,
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["*.js", "blitz-env.d.ts"],
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: directory,
      },
    },
  },
  parserOptions: {
    tsconfigRootDir: directory,
    project: ["./tsconfig.json"],
  },
  plugins: ["promise"],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
    "next/core-web-vitals",
  ],
  rules: {
    "no-warning-comments": 1,
    "no-await-in-loop": 1,
    "no-bitwise": 1,
    "no-console": 1,
    "array-callback-return": 2,
    "no-self-compare": 2,
    "no-template-curly-in-string": 2,
    "no-unmodified-loop-condition": 2,
    "no-unreachable": 2,
    "no-unreachable-loop": 2,
    "dot-notation": 2,
    eqeqeq: 2,
    "no-else-return": 2,
    "no-useless-return": 2,
    "no-var": 2,
    "operator-assignment": 2,
    "object-shorthand": 2,
    "prefer-arrow-callback": 2,
    "prefer-object-spread": 2,
    "prefer-const": 2,
    "spaced-comment": [2, "always"],
    "func-style": [2, "declaration", { allowArrowFunctions: true }],
    "no-constant-condition": [2, { checkLoops: false }],
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-misused-promises": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-floating-promises": 0,
    "@typescript-eslint/restrict-plus-operands": 0,
    "@typescript-eslint/prefer-for-of": 1,
    "@typescript-eslint/prefer-nullish-coalescing": 1,
    "@typescript-eslint/no-empty-function": 1,
    "@typescript-eslint/prefer-optional-chain": 1,
    "@typescript-eslint/prefer-string-starts-ends-with": 1,
    "@typescript-eslint/require-await": 1,
    "@typescript-eslint/no-unsafe-member-access": 1,
    "@typescript-eslint/no-unsafe-call": 1,
    "@typescript-eslint/no-unsafe-argument": 1,
    "@typescript-eslint/no-unused-vars": [
      2,
      { args: "after-used", ignoreRestSiblings: true, argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": 2,
    "@typescript-eslint/no-unused-expressions": 2,
    "@typescript-eslint/no-use-before-define": [2, { functions: false }],
    "@typescript-eslint/naming-convention": [
      2,
      {
        selector: "variableLike",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
      },
      { selector: ["typeParameter", "interface"], format: ["PascalCase"] },
    ],
    "react/jsx-boolean-value": 2,
    "react/jsx-pascal-case": 2,
    "react/jsx-curly-brace-presence": 2,
    "react/self-closing-comp": 2,
    "import/order": [2, { "newlines-between": "always" }],
    "import/newline-after-import": 2,
    "import/no-duplicates": 2,
    "import/no-anonymous-default-export": 2,
    "promise/prefer-await-to-then": 1,
  },
});
