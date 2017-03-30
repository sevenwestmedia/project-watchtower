import * as path from 'path'
import { EnvCmd } from 'env-cmd'
import CONFIG from '../build/config/config'
import { StartParam } from '../types'

const { SERVER_OUTPUT } = CONFIG

/**
 * Starts the pre-built server with the environment variables
 * defined in `.env`
 * @param args
 * - watch: Enables watch mode
 * - fast: Disables server-side rendering and type checking
 * - prod: Sets NODE_ENV to "production"
 */
const start = (...args: StartParam[]) => {

    if (args.indexOf('watch') !== -1) {
        process.env.START_WATCH_MODE = 'true'
    }

    if (args.indexOf('fast') !== -1) {
        process.env.START_FAST_MODE = 'true'
    }

    process.env.NODE_ENV = (args.indexOf('prod') !== -1)
        ? 'production'
        : 'development'

    const serverPath = path.resolve(SERVER_OUTPUT, 'server.js')

    EnvCmd(['.env', 'node', serverPath])
}

export default start
