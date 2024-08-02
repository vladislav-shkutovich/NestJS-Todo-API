import { User } from '../../src/user/schemas/user.schema'

// TODO: remove comment after a code review: https://stackoverflow.com/a/66714317/26614012
// TODO: but using { "include": ["src", "types"] } instead of { "typeRoots": ["./types"] }
declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}
