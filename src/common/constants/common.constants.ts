export const Operations = {
  INSERT: 'insert',
  UPDATE: 'update',
  DELETE: 'delete',
} as const

export type Operations = (typeof Operations)[keyof typeof Operations]
