module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "eslint:recommended",
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        "@typescript-eslint/no-empty-interface": "off",
        "no-async-promise-executor": "off",
        "@typescript-eslint/no-explicit-any": "off",
        curly: "error",
        eqeqeq: ["error", "always"],
    },
    overrides: [],
    ignorePatterns: [".vscode", "node_modules"],
};