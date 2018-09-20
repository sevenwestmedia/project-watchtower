import * as util from 'util'
import { Logger, LogObject } from './log'

const elapsed = (hrStart: [number, number]) => {
    const hrEnd = process.hrtime(hrStart)
    return util.format('%ds %dms', hrEnd[0], hrEnd[1] / 1000000)
}

const functionTimer = <T>(
    description: string,
    func: () => T,
    logger: Logger,
    logResult?: (result: T) => string,
    /** Adds a category to the log object */
    category?: string,
): T => {
    const startTime = process.hrtime()

    try {
        const result = func()
        const elapsedTime = elapsed(startTime)
        const logObj: LogObject = {
            description,
            elapsedTime,
        }
        if (logResult) {
            logObj.result = logResult(result)
        }
        if (category) {
            logObj.category = category
        }
        logger.debug(logObj, `${description} took ${elapsedTime}`)
        return result
    } catch (err) {
        const elapsedTime = elapsed(startTime)
        const logObj: LogObject = {
            description,
            elapsedTime,
            err,
        }
        if (category) {
            logObj.category = category
        }
        logger.debug(logObj, `${description} threw after ${elapsed(startTime)}`)
        throw err
    }
}

const functionTimerAsync = async <T>(
    description: string,
    func: () => Promise<T>,
    logger: Logger,
    logResult?: (result: T) => string,
    /** Adds a category to the log object */
    category?: string,
): Promise<T> => {
    const startTime = process.hrtime()

    try {
        const result = await func()
        const elapsedTime = elapsed(startTime)
        const logObj: LogObject = {
            description,
            elapsedTime,
        }
        if (logResult) {
            logObj.result = logResult(result)
        }
        if (category) {
            logObj.category = category
        }
        logger.debug(logObj, `Async ${description} took ${elapsedTime}`)
        return result
    } catch (err) {
        const elapsedTime = elapsed(startTime)
        const logObj: LogObject = { description, elapsedTime, err }
        if (category) {
            logObj.category = category
        }
        logger.debug(logObj, `Async ${description} threw after ${elapsedTime}`)
        throw err
    }
}

export { elapsed, functionTimer, functionTimerAsync }
