import { Logger } from '../../../util/log'

const formatArgs = (a: any) => typeof a === 'string' ? a : JSON.stringify(a)

export const testLogger: Logger = {
    // tslint:disable:no-console
    debug: (...args: any[]) => console.log(args.map(formatArgs)),
    info: (...args: any[]) => console.log(args.map(formatArgs)),
    warn: (...args: any[]) => console.log(args.map(formatArgs)),
    error: (...args: any[]) => {
        console.log(args.map(formatArgs))
    },
    // tslint:enable:no-console
}
