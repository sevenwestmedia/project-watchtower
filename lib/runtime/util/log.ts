export interface Logger {
    debug(msg: string | { msg: string, [key: string]: any }): void
    info(msg: string | { msg: string, [key: string]: any }): void
    warn(msg: string | { msg: string, [key: string]: any }): void
    error(msg: string): void
    error<T extends { err: Error, msg: string }>(obj: T): void
}

const logStack = (error: any) => {
    if (error && error.stack) {
        // tslint:disable-next-line no-console
        console.log(error.stack)
    }
}

export const log = (message: any, ...additional: any[]) => (
    // tslint:disable-next-line no-console
    console.log(message, ...additional)
)

export const logError = (message: any, ...additional: any[]) => {
    // tslint:disable-next-line no-console
    console.error(message, ...additional)

    logStack(message)
    additional.forEach((x) => logStack(x))
}

export const prettyJson = (obj: any) => (
    JSON.stringify(obj, undefined, 2)
)
