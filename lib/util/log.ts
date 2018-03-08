import { Logger } from '../runtime/universal'

export const prettyJson = (obj: any) => JSON.stringify(obj, undefined, 2)

// tslint:disable:no-console
const log = (method: 'trace' | 'debug' | 'log' | 'warn' | 'error', args: any[]) => {
    if (args.length === 0) {
        return
    }
    if (typeof args[0] === 'string') {
        return console[method](args[0])
    }

    console[method](prettyJson(args[1]), args[0])
}

/** Logger interface compatible console logger, does't log level info in message */
export const cliLogger: Logger = {
    trace: (...args: any[]) => log('trace', args),
    info: (...args: any[]) => log('log', args),
    warn: (...args: any[]) => log('warn', args),
    error: (...args: any[]) => log('error', args),
    fatal: (...args: any[]) => log('error', args),
    debug: (...args: any[]) => log('debug', args),
    child: () => cliLogger,
}
