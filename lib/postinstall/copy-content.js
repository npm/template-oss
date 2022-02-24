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
  '.github/workflows/codeql-analysis.yml': './codeql-analysis.yml',
  '.github/workflows/post-dependabot.yml': './post-dependabot.yml',
  '.github/workflows/pull-request.yml': './pull-request.yml',
  '.github/workflows/release-please.yml': './release-please.yml',
}

// currently no workspace module files
// const workspaceModuleFiles = {}

const workspaceRepoFiles = {
  '.github/workflows/release-please-%%pkgfsname%%.yml': './release-please-workspace.yml',
  '.github/workflows/ci-%%pkgfsname%%.yml': './ci-workspace.yml',
}

const filesToDelete = [
  // remove any eslint config files that aren't local to the project
  /^\.eslintrc\.(?!(local\.)).*/,
]

const defaultConfig = {
  applyRootRepoFiles: true,
  applyWorkspaceRepoFiles: true,
  applyRootModuleFiles: true,
  windowsCI: true,
}

const findReplace = (str, replace = {}) => {
  for (const [f, r] of Object.entries(replace)) {
    str = str.replace(new RegExp(f, 'g'), r)
  }
  return str
}

const copyFile = async (source, target, replacements) => {
  if (replacements) {
    const content = await fs.readFile(source, { encoding: 'utf-8' })
    return fs.writeFile(target, findReplace(content, replacements), { owner: 'inherit' })
  }
  return fs.copyFile(source, target, { owner: 'inherit' })
}

const copyFiles = async (targetDir, files, replacements) => {
  for (let [target, source] of Object.entries(files)) {
    target = findReplace(join(targetDir, target), replacements)
    source = join(contentDir, source)
    // if the target is a subdirectory of the path, mkdirp it first
    if (dirname(target) !== targetDir) {
      await fs.mkdir(dirname(target), {
        owner: 'inherit',
        recursive: true,
        force: true,
      })
    }
    await copyFile(source, target, replacements)
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
      if (!config.windowsCI) {
        // copyFiles already did the mkdir so we can just fs.copyFile now
        await fs.copyFile(
          join(contentDir, 'ci-no-windows.yml'),
          join(rootPath, '.github', 'workflows', 'ci.yml')
        )
      }
    }
    return
  }

  // only workspace now

  // TODO: await copyFiles(path, workspaceModuleFiles)
  // if we ever have workspace specific files

  // transform and copy all workspace repo files
  if (config.applyWorkspaceRepoFiles) {
    const workspacePkg = (await PackageJson.load(path)).content
    await copyFiles(rootPath, workspaceRepoFiles, {
      '%%pkgname%%': workspacePkg.name,
      '%%pkgfsname%%': workspacePkg.name.replace(/\//g, '-').replace(/@/g, ''),
      '%%pkgpath%%': path.substring(rootPath.length + 1),
    })
  }
}

copyContent.moduleFiles = moduleFiles
copyContent.repoFiles = repoFiles

module.exports = copyContent
