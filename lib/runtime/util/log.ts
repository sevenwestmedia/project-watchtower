export interface Logger {
    debug(msg: string | { [key: string]: any }): void
    debug(obj: { [key: string]: any }, msg: string): void
    info(msg: string | { [key: string]: any }): void
    info(obj: { [key: string]: any }, msg: string): void
    warn(msg: string): void
    warn(obj: { [key: string]: any }, msg: string): void
    error(msg: string): void
    error<T extends { err: Error }>(obj: T, msg: string): void
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
