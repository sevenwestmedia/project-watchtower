import { ChildProcess } from 'child_process'
import { Logger } from 'typescript-log'
import { watchServer, WatchServer } from '../watch/server'

import build from './build'
import { cleanCmd } from './clean'
import start from './start'

import { StartParam, WatchParam } from '..'
import { BuildConfig } from '@project-watchtower/server'

/**
 * Rebuilds the client on changes
 * @param args
 * - server: Also watches and rebuilds server
 * - client: Only run client without a server
 */
async function watch(
    log: Logger,
    buildConfig: BuildConfig,
    watchProcessEnv: NodeJS.ProcessEnv,
    ...args: WatchParam[]
): Promise<ChildProcess | WatchServer> {
    const { HAS_SERVER } = buildConfig
    const additionalStartParams: StartParam[] = []
    const env: NodeJS.ProcessEnv = { ...watchProcessEnv }

    await cleanCmd(log, buildConfig)

    const isServerWatch = HAS_SERVER && args.indexOf('server') !== -1

    if (isServerWatch) {
        return watchServer(log, buildConfig)
    }

    const clientMode = !HAS_SERVER || args.indexOf('client') !== -1

    if (clientMode) {
        return start(log, buildConfig, env, 'watch', 'client', ...additionalStartParams)
    } else {
        await build(log, buildConfig, 'server', 'dev')
        return start(log, buildConfig, env, 'watch', ...additionalStartParams)
    }
}

export default watch
