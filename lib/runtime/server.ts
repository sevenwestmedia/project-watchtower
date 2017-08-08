/*
 * The /runtime folder should only contain modules that do not have transitive dependencies!
 * All exceptions must either
 * - be dynamically imported using require() in development environments
 * - be documented in the README and set as production peerDependencies
 */

export * from './server/assets'
export * from './server/server'

import * as ssr from './server/ssr'
export { ssr }

export { default as config } from './config/config'
