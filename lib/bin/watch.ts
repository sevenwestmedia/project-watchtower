import { ChildProcess } from 'child_process'
import CONFIG from '../runtime/config/config'
import clean from './clean'
import build from './build'
import start from './start'
import { default as watchServer, WatchServer } from '../watch/server'
import { WatchParam } from '../types'

const { HAS_SERVER } = CONFIG

/**
 * Rebuilds the client on changes
 * @param args
 * - server: Also watches and rebuilds server
 * - fast: disables type checking
 * - client: Only run client without a server
 */
const watch = async (...args: WatchParam[]): Promise<ChildProcess | WatchServer> => {

    if (args.indexOf('fast') !== -1) {
        process.env.START_FAST_MODE = 'true'
    }

    const isServerWatch = HAS_SERVER
        && args.indexOf('server') !== -1

    const clientMode = !HAS_SERVER || (args.indexOf('client') !== -1)

    await clean()

    if (isServerWatch) {
        return watchServer()
    }

    if (clientMode) {
        return start('watch', 'client')
    } else {
        await build('server', 'dev')
        return start('watch')
    }
}

export default watch
