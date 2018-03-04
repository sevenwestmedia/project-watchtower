export interface LogObject {
    [key: string]: any
}

export interface ErrorObject extends LogObject {
    err?: Error
}

export interface Logger {
    trace(msg: string | LogObject): void
    trace(obj: LogObject, msg: string): void
    debug(msg: string | LogObject): void
    debug(obj: LogObject, msg: string): void
    info(msg: string | LogObject): void
    info(obj: LogObject, msg: string): void
    warn(msg: string): void
    warn(obj: LogObject, msg: string): void
    error(msg: string): void
    error(obj: ErrorObject, msg: string): void
    fatal(msg: string): void
    fatal(obj: ErrorObject, msg: string): void

    child(childObj: LogObject): Logger
}

// tslint:disable:no-console
const log = (level: string, args: any[]) => {
    if (args.length === 0) {
        return
    }

    if (typeof args[0] === 'string') {
        return console.log(level, args[0])
    }

    console.log(level, args[1], args[0])
}

export const createConsoleLogger = (): Logger => ({
    child: createConsoleLogger,
    trace: (...args: any[]) => log('TRACE', args),
    debug: (...args: any[]) => log('DEBUG', args),
    info: (...args: any[]) => log('INFO', args),
    warn: (...args: any[]) => log('WARN', args),
    error: (...args: any[]) => log('ERROR', args),
    fatal: (...args: any[]) => log('FATAL', args),
})
// tslint:enable:no-console
