import { ChildProcess } from 'child_process'
import CONFIG from '../runtime/config/config'
import clean from './clean'
import build from './build'
import start from './start'
import { default as watchServer, WatchServer } from '../watch/server'
import { StartParam, WatchParam } from '../types'

const { HAS_SERVER } = CONFIG

/**
 * Rebuilds the client on changes
 * @param args
 * - server: Also watches and rebuilds server
 * - fast: disables type checking
 * - client: Only run client without a server
 */
const watch = async (...args: WatchParam[]): Promise<ChildProcess | WatchServer> => {

    const additionalStartParams: StartParam[] = []

    if (args.indexOf('fast') !== -1) {
        additionalStartParams.push('fast')
        process.env.START_FAST_MODE = 'true'
    }

    if (args.indexOf('inspect') !== -1) {
        additionalStartParams.push('inspect')
    }

    await clean()

    const isServerWatch = HAS_SERVER
        && args.indexOf('server') !== -1

    if (isServerWatch) {
        return watchServer()
    }

    const clientMode = !HAS_SERVER || (args.indexOf('client') !== -1)

    if (clientMode) {
        return start('watch', 'client', ...additionalStartParams)
    } else {
        await build('server', 'dev')
        return start('watch', ...additionalStartParams)
    }
}

export default watch
