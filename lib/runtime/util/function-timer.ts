import * as util from 'util'
import { Logger } from './log'

const elapsed = (hrStart: [number, number]) => {
    const hrEnd = process.hrtime(hrStart)
    return util.format('%ds %dms', hrEnd[0], hrEnd[1] / 1000000)
}

const functionTimer = <T>(description: string, func: () => T, logger: Logger): T => {
    const startTime = process.hrtime()

    try {
        const result = func()
        logger.debug(`${description} took ${elapsed(startTime)}`)
        return result
    } catch (err) {
        logger.debug(`${description} threw after ${elapsed(startTime)}`)
        throw err
    }
}

const functionTimerAsync = async <T> (
    description: string,
    func: () => Promise<T>,
    logger: Logger,
): Promise<T> => {
        const startTime = process.hrtime()

        try {
            const result = await func()
            logger.debug(`Async ${description} took ${elapsed(startTime)}`)
            return result
        } catch (err) {
            logger.debug({ err }, `Async ${description} threw after ${elapsed(startTime)}`)
            throw err
        }
    }

export { elapsed, functionTimer, functionTimerAsync }
