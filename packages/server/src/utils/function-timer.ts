import { Logger, LogObject } from 'typescript-log'
import util from 'util'

export const formatElapsed = (hrEnd: [number, number]) => {
    return util.format('%ds %dms', hrEnd[0], hrEnd[1] / 1000000)
}

export const functionTimer = <T>(
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
        const elapsed = process.hrtime(startTime)
        const elapsedTime = formatElapsed(elapsed)
        const logObj: LogObject = {
            description,
            elapsed,
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
        const elapsed = process.hrtime(startTime)
        const elapsedTime = formatElapsed(elapsed)
        const logObj: LogObject = {
            description,
            elapsed,
            err,
        }
        if (category) {
            logObj.category = category
        }
        logger.debug(logObj, `${description} threw after ${elapsedTime}`)
        throw err
    }
}

export const functionTimerAsync = async <T>(
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
        const elapsed = process.hrtime(startTime)
        const elapsedTime = formatElapsed(elapsed)
        const logObj: LogObject = {
            description,
            elapsed,
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
        const elapsed = process.hrtime(startTime)
        const elapsedTime = formatElapsed(elapsed)
        const logObj: LogObject = { description, elapsed, err }
        if (category) {
            logObj.category = category
        }
        logger.debug(logObj, `Async ${description} threw after ${elapsedTime}`)
        throw err
    }
}
