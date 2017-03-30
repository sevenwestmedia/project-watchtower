export const log = (message: any, ...additional: any[]) => (
    // tslint:disable-next-line no-console
    console.log(message, ...additional)
)

export const logError = (message: any, ...additional: any[]) => (
    // tslint:disable-next-line no-console
    console.error(message, ...additional)
)

export const prettyJson = (obj: any) => (
    JSON.stringify(obj, undefined, 2)
)
