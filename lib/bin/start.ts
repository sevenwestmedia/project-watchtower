import * as path from 'path'
import { ChildProcess, ForkOptions } from 'child_process'
import * as dotenv from 'dotenv'
import CONFIG from '../runtime/config/config'
import { forkPromise } from '../runtime/util/process'
import { StartParam } from '../types'

const { HAS_SERVER, SERVER_OUTPUT } = CONFIG

/**
 * Starts the pre-built server with the environment variables
 * defined in `.env`
 * @param args
 * - watch: Enables watch mode
 * - fast: Disables server-side rendering and type checking
 * - prod: Sets NODE_ENV to "production"
 */
const start = (...args: StartParam[]): Promise<ChildProcess> => {

    if (args.indexOf('watch') !== -1) {
        process.env.START_WATCH_MODE = 'true'
    }

    if (args.indexOf('fast') !== -1) {
        process.env.START_FAST_MODE = 'true'
    }

    const isDebug = args.indexOf('debug') !== -1
    const isInspect = args.indexOf('inspect') !== -1

    if (isDebug || isInspect) {
        process.env.START_DEBUG_MODE = 'true'
    }

    process.env.NODE_ENV = (args.indexOf('prod') !== -1)
        ? 'production'
        : process.env.NODE_ENV || 'development'

    const clientMode = !HAS_SERVER || (args.indexOf('client') !== -1)

    const serverPath = clientMode
        ? path.resolve(__dirname, '..', 'server', 'start.js')
        : path.resolve(SERVER_OUTPUT, 'server.js')

    dotenv.config()

    const execArgv: string[] = process.execArgv.filter((arg: string) => (
        arg.indexOf('--debug') !== 0 && arg.indexOf('--inspect') !== 0
    ))

    if (isDebug) {
        execArgv.push('--debug')
    }
    if (isInspect) {
        execArgv.push('--inspect')
    }

    const options: ForkOptions = {
        env: process.env,
        execArgv,
    }

    return forkPromise(
        serverPath,
        [],
        options,
        true,
    )
}

export default start
