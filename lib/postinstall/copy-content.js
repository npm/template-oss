const { dirname, join, resolve } = require('path')
const fs = require('@npmcli/fs')
const PackageJson = require('@npmcli/package-json')

const contentDir = resolve(__dirname, '..', 'content')

// keys are destination paths in the target project
// values are paths to contents relative to '../content/'
const moduleFiles = {
  '.eslintrc.js': './eslintrc.js',
  '.gitignore': './gitignore',
  '.npmrc': './npmrc',
  'SECURITY.md': './SECURITY.md',
}

const repoFiles = {
  '.commitlintrc.js': './commitlintrc.js',
  '.github/workflows/ci.yml': './ci.yml',
  '.github/ISSUE_TEMPLATE/bug.yml': './bug.yml',
  '.github/ISSUE_TEMPLATE/config.yml': './config.yml',
  '.github/CODEOWNERS': './CODEOWNERS',
  '.github/dependabot.yml': './dependabot.yml',
  '.github/workflows/audit.yml': './audit.yml',
  '.github/workflows/pull-request.yml': './pull-request.yml',
  '.github/workflows/release-please.yml': './release-please.yml',
}

// currently no workspace moduleFiles
// const workspaceContent = {}
// const workspaceRootContent = {}

const filesToDelete = [
  // remove any eslint config files that aren't local to the project
  /^\.eslintrc\.(?!(local\.)).*/,
]

const defaultConfig = {
  applyRootRepoFiles: true,
  applyWorkspaceRepoFiles: true,
  applyRootModuleFiles: true,
}

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
const copyContent = async (path, rootPath, config) => {
  config = { ...defaultConfig, ...config }
  const isWorkspace = path !== rootPath

  const contents = await fs.readdir(path)

  if (isWorkspace || config.applyRootModuleFiles) {
    // delete files and copy moduleFiles if it's a workspace
    // or if we enabled doing so for the root
    for (const file of contents) {
      if (filesToDelete.some((p) => p.test(file))) {
        await fs.rm(join(path, file))
      }
    }
    await copyFiles(path, moduleFiles)
  }

  if (!isWorkspace) {
    if (config.applyRootRepoFiles) {
      await copyFiles(rootPath, repoFiles)
    }
    return
  } // only workspace now

  // TODO: await copyFiles(path, workspaceFiles)
  // if we ever have workspace specific files

  if (config.applyWorkspaceRepoFiles) {
    // copy and edit workspace repo file (ci github action)
    const workspacePkg = (await PackageJson.load(path)).content
    const workspaceName = workspacePkg.name
    const workflowPath = join(rootPath, '.github', 'workflows')
    await fs.mkdir(workflowPath, {
      owner: 'inherit',
      recursive: true,
      force: true,
    })

    let workflowData = await fs.readFile(
      join(contentDir, './ci-workspace.yml'),
      { encoding: 'utf-8' }
    )

    const relPath = path.substring(rootPath.length + 1)
    workflowData = workflowData.replace(/%%pkgpath%%/g, relPath)
    workflowData = workflowData.replace(/%%pkgname%%/g, workspaceName)

    await fs.writeFile(join(workflowPath, `ci-${workspaceName}.yml`), workflowData)
  }
}
copyContent.moduleFiles = moduleFiles
copyContent.repoFiles = repoFiles

module.exports = copyContent
