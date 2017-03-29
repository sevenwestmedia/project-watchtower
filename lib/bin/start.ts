import * as path from 'path'
import { EnvCmd } from 'env-cmd'
import PATHS from '../build/paths'

const { SERVER_OUTPUT } = PATHS

export const start = (...args: string[]) => {

    if (args.indexOf('watch') !== -1) {
        process.env.WATCH_MODE = 'true'
    }

    if (args.indexOf('fast') !== -1) {
        process.env.FAST_MODE = 'true'
    }

    const serverPath = path.resolve(SERVER_OUTPUT, 'server.js')

    EnvCmd(['.env', 'node', serverPath])
}

export default start
