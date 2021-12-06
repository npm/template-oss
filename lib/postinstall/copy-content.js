const { dirname, join, resolve } = require('path')
const fs = require('@npmcli/fs')
const { readFile, writeFile } = require('fs/promises')
const PackageJson = require('@npmcli/package-json')

const contentDir = resolve(__dirname, '..', 'content')

// keys are destination paths in the target project
// values are paths to contents relative to '../content/'
const content = {
  '.eslintrc.js': './eslintrc.js',
  '.gitignore': './gitignore',
  'LICENSE.md': './LICENSE.md',
  'SECURITY.md': './SECURITY.md',
}

const rootContent = {
  '.github/workflows/ci.yml': './ci.yml',
  '.github/ISSUE_TEMPLATE/bug.yml': './bug.yml',
  '.github/ISSUE_TEMPLATE/config.yml': './config.yml',
  '.github/CODEOWNERS': './CODEOWNERS',
}

// currently no workspace content
// const workspaceContent = {}
// const workspaceRootContent = {}

const filesToDelete = [
  // remove any other license files
  /^LICENSE*/,
  // remove any eslint config files that aren't local to the project
  /^\.eslintrc\.(?!(local\.)).*/,
]

const copyFiles = async (targetDir, files) => {
  for (let [target, source] of Object.entries(files)) {
    source = join(contentDir, source)
    target = join(targetDir, target)
    // if the target is a subdirectory of the path, mkdirp it first
    if (dirname(target) !== targetDir) {
      await fs.mkdir(dirname(target), {
        owner: 'inherit',
        recursive: true,
        force: true,
      })
    }
    await fs.copyFile(source, target, { owner: 'inherit' })
  }
}

// given a root directory, copy all files in the content map
// after purging any files we need to delete
const copyContent = async (path, rootPath) => {
  const contents = await fs.readdir(path)

  const isWorkspace = path !== rootPath

  for (const file of contents) {
    if (filesToDelete.some((p) => p.test(file))) {
      await fs.rm(join(path, file))
    }
  }

  await copyFiles(path, content)
  if (!isWorkspace) {
    await copyFiles(rootPath, rootContent)
    return
  }

  // isWorkspace === true
  // if we had workspace specific content...
  // await copyFiles(path, workspaceContent)
  // await copyFiles(rootPath, workspaceRootContent)

  const workspacePkg = (await PackageJson.load(path)).content
  const workspaceName = workspacePkg.name
  const workflowPath = join(rootPath, '.github', 'workflows')
  await fs.mkdir(workflowPath, {
    owner: 'inherit',
    recursive: true,
    force: true,
  })

  let workflowData = await readFile(
    join(contentDir, './ci-workspace.yml'),
    { encoding: 'utf-8' }
  )

  workflowData = workflowData.replace(/%%pkgpath%%/g, path)
  workflowData = workflowData.replace(/%%pkgname%%/g, workspaceName)

  await writeFile(join(workflowPath, `ci-${workspaceName}.yml`), workflowData)
}
copyContent.content = content
copyContent.rootContent = rootContent

module.exports = copyContent
