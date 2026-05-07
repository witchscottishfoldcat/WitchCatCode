// In its own file to avoid circular dependencies
export const FILE_EDIT_TOOL_NAME = 'Edit'

// Permission pattern for granting session-level access to the project's .witchcat/ folder
// (Constant name kept as CLAUDE_FOLDER_* per project convention — value updated for the
// witchcat rename.)
export const CLAUDE_FOLDER_PERMISSION_PATTERN = '/.witchcat/**'

// Permission pattern for granting session-level access to the global ~/.witchcat/ folder
export const GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN = '~/.witchcat/**'

export const FILE_UNEXPECTEDLY_MODIFIED_ERROR =
  'File has been unexpectedly modified. Read it again before attempting to write it.'
