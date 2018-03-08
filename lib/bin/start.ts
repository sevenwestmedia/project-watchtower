import * as path from 'path'
import * as dotenv from 'dotenv'
import { ChildProcess, ForkOptions } from 'child_process'
import { forkPromise } from '../util/process'
import { StartParam } from '../types'
import { BuildConfig } from '../../lib'
import { setBaseDir } from '../runtime/server/base-dir'
import { Logger } from '../runtime/universal'

/**
 * Starts the pre-built server with the environment variables
 * defined in `.env`
 * @param args
 * - watch: Enables watch mode
 * - fast: Disables server-side rendering and type checking
 * - prod: Sets NODE_ENV to "production"
 */
const start = (
    log: Logger,
    buildConfig: BuildConfig,
    ...args: StartParam[]
): Promise<ChildProcess> => {
    // When running in local dev, we have a different process.cwd() than
    // when running in production. This allows static files and such to resolve
    const { HAS_SERVER, SERVER_OUTPUT } = buildConfig
    setBaseDir(SERVER_OUTPUT)
    process.env.PROJECT_DIR = buildConfig.BASE

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

    process.env.NODE_ENV =
        args.indexOf('prod') !== -1 ? 'production' : process.env.NODE_ENV || 'development'

    const clientMode = !HAS_SERVER || args.indexOf('client') !== -1

    const serverPath = clientMode
        ? path.resolve(__dirname, '..', 'server', 'start.js')
        : path.resolve(SERVER_OUTPUT, 'server.js')

    dotenv.config({
        path: path.join(buildConfig.BASE, '.env'),
    })

    const execArgv: string[] = process.execArgv.filter(
        (arg: string) => arg.indexOf('--debug') !== 0 && arg.indexOf('--inspect') !== 0,
    )

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

    return forkPromise(log, serverPath, [], options, true)
}

export default start
