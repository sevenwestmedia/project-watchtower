import * as path from 'path'
import { ChildProcess } from 'child_process'
import * as dotenv from 'dotenv'
import CONFIG from '../config/config'
import { forkPromise } from '../util/process'
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

    process.env.NODE_ENV = (args.indexOf('prod') !== -1)
        ? 'production'
        : 'development'

    const serverPath = HAS_SERVER
        ? path.resolve(SERVER_OUTPUT, 'server.js')
        : path.resolve(__dirname, '..', 'server', 'start.js')

    dotenv.config()

    return forkPromise(
        serverPath,
        [],
        { env: process.env },
        true,
    )
}

export default start
