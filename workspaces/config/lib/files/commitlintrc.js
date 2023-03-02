module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [{$ changelogTypes | pluck("type") | wrap('\'') | join(', ') $}]],
    'header-max-length': [2, 'always', 80],
    'subject-case': [0, 'always', ['lower-case', 'sentence-case', 'start-case']],
  },
}
