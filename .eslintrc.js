module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'jsx-a11y', 'import'],
  rules: {
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-cycle': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
  },

};
