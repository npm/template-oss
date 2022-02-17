const PackageJson = require('@npmcli/package-json')
const patchPackage = require('../postinstall/update-package.js')

const unwantedPackages = [
  '@npmcli/lint',
  'eslint-plugin-promise',
  'eslint-plugin-standard',
  'eslint-plugin-import',
  'standard',
]

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const check = async (root) => {
  const pkg = (await PackageJson.load(root)).content
  const changes = Object.entries(patchPackage.changes)
  const problems = []
  const incorrectFields = []
  // 1. ensure package.json changes have been applied
  for (const [key, value] of changes) {
    if (!hasOwn(pkg, key)) {
      incorrectFields.push({
        name: key,
        found: pkg[key],
        expected: value,
      })
    } else if (value && typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        if (!hasOwn(pkg[key], subKey) ||
          pkg[key][subKey] !== subValue) {
          incorrectFields.push({
            name: `${key}.${subKey}`,
            found: pkg[key][subKey],
            expected: subValue,
          })
        }
      }
    } else {
      if (pkg[key] !== patchPackage.changes[key]) {
        incorrectFields.push({
          name: key,
          found: pkg[key],
          expected: value,
        })
      }
    }
  }

  if (incorrectFields.length) {
    problems.push({
      message: [
        `The following package.json fields are incorrect:`,
        ...incorrectFields.map((field) => {
          const message = [
            'Field:',
            `${JSON.stringify(field.name)}`,
            'Expected:',
            `${JSON.stringify(field.expected)}`,
            'Found:',
            `${JSON.stringify(field.found)}`,
          ].join(' ')
          return `  ${message}`
        }),
      ].join('\n'),
      solution: 'npm rm @npmcli/template-oss && npm i -D @npmcli/template-oss',
    })
  }

  // 2. ensure packages that should not be present are removed
  const mustRemove = unwantedPackages.filter((name) => {
    return hasOwn(pkg.dependencies || {}, name) ||
      hasOwn(pkg.devDependencies || {}, name)
  })

  if (mustRemove.length) {
    problems.push({
      message: [
        'The following unwanted packages were found:',
        ...mustRemove.map((p) => `  ${p}`),
      ].join('\n'),
      solution: `npm rm ${mustRemove.join(' ')}`,
    })
  }

  return problems
}

check.unwantedPackages = unwantedPackages

module.exports = check
