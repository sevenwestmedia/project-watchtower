import path from 'path'
import * as dotenv from 'dotenv'
import { ChildProcess, ForkOptions } from 'child_process'
import { forkPromise } from '../util/process'
import { StartParam } from '../types'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

/**
 * Starts the pre-built server with the environment variables
 * defined in `.env`
 * @param args
 * - watch: Enables watch mode
 * - fast: Disables server-side rendering and type checking
 * - prod: Sets NODE_ENV to "production"
 * - debug: Starts with debugging enabled
 * - debug-brk: Starts with debugging and waits for debugger to attach
 * - --debug-port <port>: The port to debug on
 */
const start = (
    log: Logger,
    buildConfig: BuildConfig,
    startEnv: NodeJS.ProcessEnv,
    ...args: StartParam[]
): Promise<ChildProcess> => {
    // When running in local dev, we have a different process.cwd() than
    // when running in production. This allows static files and such to resolve
    const { HAS_SERVER, OUTPUT } = buildConfig
    const env: NodeJS.ProcessEnv = {
        ...startEnv,
        PROJECT_DIR: buildConfig.BASE,
        NODE_ENV:
            args.indexOf('prod') !== -1 ? 'production' : process.env.NODE_ENV || 'development',
        PORT: buildConfig.DEV_SERVER_PORT.toString(),
    }

    if (args.indexOf('watch') !== -1) {
        env.START_WATCH_MODE = 'true'
    }

    if (args.indexOf('fast') !== -1) {
        env.START_FAST_MODE = 'true'
    }

    const isDebug = args.indexOf('debug') !== -1
    const isDebugBrk = args.indexOf('debug-brk') !== -1
    let debugPort = 5858

    if (isDebug || isDebugBrk) {
        env.START_DEBUG_MODE = 'true'
    }

    const portIndex = args.indexOf('--debug-port')
    if (portIndex !== -1) {
        debugPort = Number(args[portIndex + 1])
        args.slice(portIndex, 2)
    }

    const clientMode = !HAS_SERVER || args.indexOf('client') !== -1

    const serverPath = clientMode
        ? path.resolve(__dirname, '..', 'server', 'start.js')
        : path.resolve(OUTPUT, 'server.js')

    dotenv.config({
        path: path.join(buildConfig.BASE, '.env'),
    })

    const execArgv: string[] = process.execArgv.filter(
        (arg: string) => arg.indexOf('--inspect') !== 0,
    )

    if (isDebug) {
        execArgv.push(`--inspect=${debugPort}`)
    }

    if (isDebugBrk) {
        execArgv.push(`--inspect-brk=${debugPort}`)
    }

    const options: ForkOptions = {
        env: {
            ...process.env,
            ...env,
        },
        execArgv,
    }

    return forkPromise(log, serverPath, [], options, true)
}

export default start
