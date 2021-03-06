module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
    node: true,
    jest: true,
  },
  plugins: ["jest"],
  extends: ["airbnb-base"],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    "no-console": "off",
    "no-plusplus": [
      2,
      {
        allowForLoopAfterthoughts: true,
      },
    ],
  },
};
