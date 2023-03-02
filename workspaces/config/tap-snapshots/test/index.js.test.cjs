/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/index.js TAP resolved to content index > full output 1`] = `
Object {
  "allowedPackages": Array [],
  "allowPaths": Array [
    "**/.gitignore",
    "/bin/",
    "/lib/",
    "/.eslintrc.local.*",
    "/docs/",
    "/tap-snapshots/",
    "/test/",
    "/scripts/",
    "/README*",
    "/LICENSE*",
    "/CHANGELOG*",
    "/map.js",
  ],
  "branches": Array [
    "main",
    "latest",
  ],
  "changelogTypes": Array [
    Object {
      "hidden": false,
      "section": "Features",
      "type": "feat",
    },
    Object {
      "hidden": false,
      "section": "Bug Fixes",
      "type": "fix",
    },
    Object {
      "hidden": false,
      "section": "Documentation",
      "type": "docs",
    },
    Object {
      "hidden": false,
      "section": "Dependencies",
      "type": "deps",
    },
    Object {
      "hidden": true,
      "type": "chore",
    },
  ],
  "ciVersions": Array [
    "14.17.0",
    "14.x",
    "16.13.0",
    "16.x",
    "18.0.0",
    "18.x",
  ],
  "codeowner": "@npm/cli-team",
  "defaultBranch": "main",
  "dependabot": "increase-if-necessary",
  "distPaths": Array [
    "bin/",
    "lib/",
  ],
  "ignorePaths": Array [],
  "lockfile": false,
  "macCI": true,
  "npm": "npm",
  "npmSpec": "latest",
  "npx": "npx",
  "org": "npm",
  "releaseBranches": "release/v*",
  "requiredPackages": Object {
    "devDependencies": Array [
      "@npmcli/eslint-config",
      "tap",
    ],
  },
  "rootModule": Object {
    "add": Object {
      ".eslintrc.js": "files/eslintrc.js",
      ".gitignore": "files/gitignore",
      ".npmrc": "files/npmrc",
      "CODE_OF_CONDUCT.md": "files/CODE_OF_CONDUCT.md",
      "package.json": "files/pkg.json",
      "SECURITY.md": "files/SECURITY.md",
    },
    "rm": Array [
      ".eslintrc.!(js|local.*)",
    ],
  },
  "rootRepo": Object {
    "add": Object {
      ".commitlintrc.js": "files/commitlintrc.js",
      ".github/actions/audit/action.yml": "actions/audit.yml",
      ".github/actions/changed-files/action.yml": "actions/changed-files.yml",
      ".github/actions/changed-workspaces/action.yml": "actions/changed-workspaces.yml",
      ".github/actions/conclude-check/action.yml": "actions/conclude-check.yml",
      ".github/actions/create-check/action.yml": "actions/create-check.yml",
      ".github/actions/deps/action.yml": "actions/deps.yml",
      ".github/actions/lint/action.yml": "actions/lint.yml",
      ".github/actions/setup/action.yml": "actions/setup.yml",
      ".github/actions/test/action.yml": "actions/test.yml",
      ".github/actions/upsert-comment/action.yml": "actions/upsert-comment.yml",
      ".github/CODEOWNERS": "files/CODEOWNERS",
      ".github/dependabot.yml": Object {
        "file": "files/dependabot.yml",
        "filter": Function filter(p),
        "parser": Function parser(),
      },
      ".github/ISSUE_TEMPLATE/bug.yml": "files/bug.yml",
      ".github/ISSUE_TEMPLATE/config.yml": "files/config.yml",
      ".github/matchers/tap.json": "files/tap.json",
      ".github/workflows/audit.yml": "workflows/audit.yml",
      ".github/workflows/ci.yml": "workflows/ci.yml",
      ".github/workflows/codeql-analysis.yml": "workflows/codeql-analysis.yml",
      ".github/workflows/post-dependabot.yml": "workflows/post-dependabot.yml",
      ".github/workflows/pull-request.yml": Object {
        "file": "workflows/pull-request.yml",
        "filter": Function isPublic(p),
      },
      ".github/workflows/release-integration.yml": Object {
        "file": "workflows/release-integration.yml",
        "filter": Function isPublic(p),
      },
      ".github/workflows/release.yml": Object {
        "file": "workflows/release.yml",
        "filter": Function isPublic(p),
      },
      ".release-please-manifest.json": Object {
        "file": "files/release-please-manifest.json",
        "filter": Function isPublic(p),
        "parser": Function parser(),
      },
      "release-please-config.json": Object {
        "file": "files/release-please-config.json",
        "filter": Function isPublic(p),
        "parser": Function parser(),
      },
    },
    "rm": Object {
      ".github/workflows/pull-request.yml": Object {
        "filter": Function filter(p),
      },
      ".github/workflows/release-please.yml": true,
      ".github/workflows/release-test.yml": true,
    },
  },
  "runsOn": "ubuntu-latest",
  "shell": "bash",
  "unwantedPackages": Array [
    "eslint",
    "eslint-plugin-node",
    "@npmcli/lint",
    "eslint-plugin-promise",
    "eslint-plugin-standard",
    "eslint-plugin-import",
    "standard",
  ],
  "windowsCI": true,
  "workspaceModule": Object {
    "add": Object {
      ".eslintrc.js": "files/eslintrc.js",
      ".gitignore": "files/gitignore",
      "package.json": "files/pkg.json",
    },
    "rm": Array [
      ".npmrc",
      ".eslintrc.!(js|local.*)",
      "SECURITY.md",
    ],
  },
  "workspaceRepo": Object {
    "add": Object {
      ".github/actions/audit/action.yml": "actions/audit.yml",
      ".github/actions/changed-files/action.yml": "actions/changed-files.yml",
      ".github/actions/changed-workspaces/action.yml": "actions/changed-workspaces.yml",
      ".github/actions/conclude-check/action.yml": "actions/conclude-check.yml",
      ".github/actions/create-check/action.yml": "actions/create-check.yml",
      ".github/actions/deps/action.yml": "actions/deps.yml",
      ".github/actions/lint/action.yml": "actions/lint.yml",
      ".github/actions/setup/action.yml": "actions/setup.yml",
      ".github/actions/test/action.yml": "actions/test.yml",
      ".github/actions/upsert-comment/action.yml": "actions/upsert-comment.yml",
      ".github/dependabot.yml": Object {
        "file": "files/dependabot.yml",
        "filter": Function filter(p),
        "parser": Function parser(),
      },
      ".github/matchers/tap.json": "files/tap.json",
      ".github/workflows/audit.yml": "workflows/audit.yml",
      ".github/workflows/ci.yml": "workflows/ci.yml",
      ".github/workflows/codeql-analysis.yml": "workflows/codeql-analysis.yml",
      ".github/workflows/post-dependabot.yml": "workflows/post-dependabot.yml",
      ".github/workflows/pull-request.yml": Object {
        "file": "workflows/pull-request.yml",
        "filter": Function isPublic(p),
      },
      ".github/workflows/release-integration.yml": Object {
        "file": "workflows/release-integration.yml",
        "filter": Function isPublic(p),
      },
      ".github/workflows/release.yml": Object {
        "file": "workflows/release.yml",
        "filter": Function isPublic(p),
      },
      ".release-please-manifest.json": Object {
        "file": "files/release-please-manifest.json",
        "filter": Function isPublic(p),
        "parser": Function parser(),
      },
      "release-please-config.json": Object {
        "file": "files/release-please-config.json",
        "filter": Function isPublic(p),
        "parser": Function parser(),
      },
    },
    "rm": Object {
      ".github/workflows/ci-{{ pkgNameFs }}.yml": true,
      ".github/workflows/pull-request.yml": Object {
        "filter": Function filter(p),
      },
      ".github/workflows/release-please-{{ pkgNameFs }}.yml": true,
    },
  },
}
`
