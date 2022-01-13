const { join } = require('path')
const fs = require('@npmcli/fs')
const t = require('tap')
const getConfig = require('../../lib/config.js')

const copyContent = require('../../lib/postinstall/copy-content.js')

t.test('copies content', async (t) => {
  const root = t.testdir()

  await copyContent(root, root)
  for (let target of Object.keys(copyContent.moduleFiles)) {
    target = join(root, target)
    await t.resolves(fs.stat(target))
  }
  for (let target of Object.keys(copyContent.repoFiles)) {
    target = join(root, target)
    await t.resolves(fs.stat(target))
  }
})

t.test('removes files', async (t) => {
  const content = {
    '.eslintrc.json': '{}',
    '.eslintrc.yml': '',
    '.eslintrc.local.json': '{}',
    'something.txt': '',
  }
  const keepContent = [
    '.eslintrc.local.json',
    'something.txt',
  ]
  const root = t.testdir(content, {
    applyRootRepoFiles: true,
    applyWorkspaceRepoFiles: true,
    applyRootModuleFiles: true,
  })

  await copyContent(root, root)
  for (const target of Object.keys(copyContent.moduleFiles)) {
    const fullTarget = join(root, target)
    await t.resolves(fs.stat(fullTarget), `copied ${target}`)
  }
  for (const target of Object.keys(copyContent.repoFiles)) {
    const fullTarget = join(root, target)
    await t.resolves(fs.stat(fullTarget), `copied ${target}`)
  }

  for (const target in content) {
    const fullTarget = join(root, target)
    if (keepContent.find((f) => f === target)) {
      await t.resolves(fs.stat(fullTarget), `left existing ${target}`)
    } else {
      await t.rejects(fs.stat(fullTarget), { code: 'ENOENT' }, `removed ${target}`)
    }
  }
})

t.test('handles workspaces', async (t) => {
  const pkgWithWorkspaces = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        applyRootRepoFiles: true,
        applyWorkspaceRepoFiles: true,
        applyRootModuleFiles: true,
        workspaces: ['workspace/a', 'workspace/b'],
      },
    }),
    workspace: {
      a: {
        'package.json': JSON.stringify({
          name: 'amazinga',
        }),
      },
      b: {
        'package.json': JSON.stringify({
          name: '@somenamespace/amazingb',
        }),
      },
    },
  }
  const root = t.testdir(pkgWithWorkspaces)
  const workspacea = join(root, 'workspace', 'a')
  const config = await getConfig(root)
  await copyContent(workspacea, root, config)

  // change should have applied to the workspace, not the root
  await t.resolves(fs.stat(join(root, 'workspace', 'a', '.eslintrc.js')))
  await t.rejects(fs.stat(join(root, 'workspace', 'b', '.eslintrc.js')))

  await t.rejects(fs.stat(join(root, '.eslintrc.js')))
  await copyContent(root, root, config)
  await t.resolves(fs.stat(join(root, '.eslintrc.js')))
  // should have made the workspace action in the root
  await t.resolves(fs.stat(join(root, '.github', 'workflows', 'ci-amazinga.yml')))
  await t.resolves(fs.stat(join(root, '.github', 'ISSUE_TEMPLATE', 'bug.yml')))

  const workspaceb = join(root, 'workspace', 'b')
  await copyContent(workspaceb, root, config)

  await t.resolves(fs.stat(join(root, '.github', 'workflows', 'ci-somenamespace-amazingb.yml')))
})

t.test('handles workspaces with no root repo files', async (t) => {
  const pkgWithWorkspaces = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        applyRootRepoFiles: false,
        applyWorkspaceRepoFiles: true,
        applyRootModuleFiles: true,

        workspaces: ['workspace/a', 'workspace/b'],
      },
    }),
    workspace: {
      a: {
        'package.json': JSON.stringify({
          name: 'amazinga',
        }),
      },
      b: {
        'package.json': JSON.stringify({
          name: 'amazingb',
        }),
      },
    },
  }

  const root = t.testdir(pkgWithWorkspaces)
  const workspacea = join(root, 'workspace', 'a')
  const config = await getConfig(root)
  await copyContent(workspacea, root, config)
  await copyContent(root, root, config)

  await t.resolves(fs.stat(join(root, '.github', 'workflows', 'ci-amazinga.yml')))
  await t.rejects(fs.stat(join(root, '.github', 'ISSUE_TEMPLATE', 'bug.yml')))
  await t.resolves(fs.stat(join(root, 'workspace', 'a', '.eslintrc.js')))
  await t.rejects(fs.stat(join(root, 'workspace', 'b', '.eslintrc.js')))
  await t.resolves(fs.stat(join(root, '.eslintrc.js')))
})

t.test('handles workspaces with no root repo and repo files', async (t) => {
  const pkgWithWorkspaces = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        applyRootRepoFiles: false,
        applyWorkspaceRepoFiles: false,
        applyRootModuleFiles: true,

        workspaces: ['workspace/a', 'workspace/b'],
      },
    }),
    workspace: {
      a: {
        'package.json': JSON.stringify({
          name: 'amazinga',
        }),
      },
      b: {
        'package.json': JSON.stringify({
          name: 'amazingb',
        }),
      },
    },
  }

  const root = t.testdir(pkgWithWorkspaces)
  const workspacea = join(root, 'workspace', 'a')
  const config = await getConfig(root)
  await copyContent(workspacea, root, config)

  await t.rejects(fs.stat(join(root, '.github', 'workflows', 'ci-amazinga.yml')))
  await t.rejects(fs.stat(join(root, '.github', 'ISSUE_TEMPLATE', 'bug.yml')))
  await t.resolves(fs.stat(join(root, 'workspace', 'a', '.eslintrc.js')))
  await t.rejects(fs.stat(join(root, 'workspace', 'b', '.eslintrc.js')))

  await t.rejects(fs.stat(join(root, '.eslintrc.js')))
  await copyContent(root, root, config)
  await t.resolves(fs.stat(join(root, '.eslintrc.js')))
  await t.rejects(fs.stat(join(root, '.github', 'ISSUE_TEMPLATE', 'bug.yml')))
})

t.test('handles workspaces with no root files', async (t) => {
  const pkgWithWorkspaces = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        applyRootRepoFiles: false,
        applyWorkspaceRepoFiles: false,
        applyRootModuleFiles: false,

        workspaces: ['workspace/a', 'workspace/b'],
      },
    }),
    workspace: {
      a: {
        'package.json': JSON.stringify({
          name: 'amazinga',
        }),
      },
      b: {
        'package.json': JSON.stringify({
          name: 'amazingb',
        }),
      },
    },
  }

  const root = t.testdir(pkgWithWorkspaces)
  const workspacea = join(root, 'workspace', 'a')
  const config = await getConfig(root)
  await copyContent(workspacea, root, config)

  await t.rejects(fs.stat(join(root, '.github', 'workflows', 'ci-amazinga.yml')))
  await t.rejects(fs.stat(join(root, '.github', 'ISSUE_TEMPLATE', 'bug.yml')))
  await t.resolves(fs.stat(join(root, 'workspace', 'a', '.eslintrc.js')))
  await t.rejects(fs.stat(join(root, 'workspace', 'b', '.eslintrc.js')))

  await t.rejects(fs.stat(join(root, '.eslintrc.js')))
  await copyContent(root, root, config)
  await t.rejects(fs.stat(join(root, '.eslintrc.js')))
  await t.rejects(fs.stat(join(root, '.github', 'workflows', 'ci-amazinga.yml')))
  await t.rejects(fs.stat(join(root, '.github', 'ISSUE_TEMPLATE', 'bug.yml')))
})

t.test('no windows ci', async (t) => {
  const pkgWithNoWindowsCI = {
    'package.json': JSON.stringify({
      name: 'testpkg',
      templateOSS: {
        windowsCI: false,
      },
    }),
  }
  const root = t.testdir(pkgWithNoWindowsCI)
  const config = await getConfig(root)
  await copyContent(root, root, config)
  const target = join(root, '.github', 'workflows', 'ci.yml')
  const contents = await fs.readFile(target, 'utf8')
  await t.notMatch(/windows/, contents, 'no windows ci')
})
