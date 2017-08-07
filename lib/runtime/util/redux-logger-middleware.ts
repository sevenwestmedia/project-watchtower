import * as redux from 'redux'
import { Logger } from 'lib/runtime/util/log'

export const createReduxLoggerMiddleware = (logger: Logger) =>
    <S>() =>
        (next: redux.Dispatch<S>) =>
            (action: any) => {
                let actionDescription = action.type
                if (action.meta) {
                    actionDescription = `${actionDescription} > ${JSON.stringify(action.meta)}`
                }
                if (action.payload) {
                    const output = typeof action.payload === 'string' ? action.payload : '{...}'
                    // tslint:disable-next-line max-line-length
                    actionDescription = `${actionDescription} > ${action.payload ? `/w payload: ${output}` : ''}`
                }

                // new error payload strategy
                if (action.isError) {
                    const logMsg = `Failed to perform client action ${actionDescription}`
                    const logObj = { err: action, event: 'ActionFailure', msg: logMsg }
                    logger.warn(logObj)
                } else if (action.error) { // old error payload strategy
                    const logMsg = `Failed to perform client action ${actionDescription}`
                    const logObj = { err: action, event: 'ActionFailure', msg: logMsg }

                    logger.warn(logObj)
                }

                logger.debug(`dispatching: ${actionDescription}`)

                const result = next(action)

                logger.debug(`finished processing: ${actionDescription} (including react updates)`)

                return result
            }
