module.exports = {
  env: {
    browser: true,
    es2021: true,
    'cypress/globals': true,
  },
  extends: [
    'cypress/recommended',
  ],
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'cypress/no-assigning-return-values': 'off',
    'cypress/no-unnecessary-waiting': 'off',
    'cypress/assertion-before-screenshot': 'off',
    'cypress/no-force': 'off',
    'cypress/no-pause': 'off',
  },
};
