import * as redux from 'redux'

// @TODO revisit and make logger and action types correct
const reduxLoggerMiddleware = (logger: any) =>
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
                    const logObj = { err: action, event: 'ActionFailure' }
                    const logMsg = `Failed to perform client action ${actionDescription}`
                    logger.warn(logObj, logMsg)
                } else if (action.error) { // old error payload strategy
                    const logObj = { err: action, event: 'ActionFailure' }
                    const logMsg = `Failed to perform client action ${actionDescription}`

                    logger.warn(logObj, logMsg)
                }

                logger.debug(`dispatching: ${actionDescription}`)

                const result = next(action)

                logger.debug(`finished processing: ${actionDescription} (including react updates)`)

                return result
            }

export default reduxLoggerMiddleware
