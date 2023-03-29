
  name: 'my-workspace',
  templateOSS: {
    // copy repo files for this workspace
    workspaceRepo: true,
    // copy module files for this workspace
    moduleRepo: true,
    // Changes windowsCI setting for this workspace
    windowsCI: false,
  }
}
