const { join } = require('path')
const fs = require('@npmcli/fs')

const patchPackage = require('./package.js')

const unwantedPackages = [
  '@npmcli/lint',
  'eslint-plugin-promise',
  'eslint-plugin-standard',
  'eslint-plugin-import',
]

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const check = async (root) => {
  const pkgPath = join(root, 'package.json')
  try {
    var contents = await fs.readFile(pkgPath, { encoding: 'utf8' })
  } catch (err) {
    throw new Error('No package.json found')
  }

  const pkg = JSON.parse(contents)

  const problems = []

  const incorrectFields = []
  // 1. ensure package.json changes have been applied
  for (const [key, value] of Object.entries(patchPackage.changes)) {
    if (!hasOwn(pkg, key)) {
      incorrectFields.push({
        name: key,
        found: pkg[key],
        expected: value,
      })
      continue
    }

    if (value && typeof value === 'object') {
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
          const { name, found, expected } = field
          return `  Field: "${name}" Expected: "${expected}" Found: "${found}"`
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
        ...mustRemove,
      ].join(' '),
      solution: `npm rm ${mustRemove.join(' ')}`,
    })
  }

  return problems
}

check.unwantedPackages = unwantedPackages

module.exports = check
