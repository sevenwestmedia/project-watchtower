import { Logger } from '../../util/log'

export const testLogger: Logger = {
    // tslint:disable:no-console
    debug: (msg) => console.log(msg),
    info: (msg) => console.log(msg),
    warn: (msg) => console.log(msg),
    error: (...args: any[]) => {
        console.log(args)
    },
    // tslint:enable:no-console
}
