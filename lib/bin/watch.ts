import { ChildProcess } from 'child_process'
import CONFIG from '../runtime/config/config'
import clean from './clean'
import build from './build'
import start from './start'
import { default as watchServer, WatchServer } from '../watch/server'

const { HAS_SERVER } = CONFIG

/**
 * Rebuilds the client on changes
 * @param args
 * - server: Also watches and rebuilds server
 * - fast: disables type checking
 */
const watch = async (...args: string[]): Promise<ChildProcess | WatchServer> => {

    if (args.indexOf('fast') !== -1) {
        process.env.START_FAST_MODE = 'true'
    }

    const isServerWatch = HAS_SERVER
        && args.indexOf('server') !== -1

    await clean()

    if (isServerWatch) {
        return watchServer()
    }

    if (HAS_SERVER) {
        await build('server', 'dev')
    }

    return start('watch')
}

export default watch
