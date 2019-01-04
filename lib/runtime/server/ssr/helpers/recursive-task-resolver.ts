import { Logger } from 'typescript-log'
import { PromiseTracker } from '../../../universal'

const delay = (forMs: number) => new Promise(resolve => setTimeout(resolve, forMs))
const component = 'RecursiveTaskResolver'

const timedOut = Symbol('Timed out')

function innerResolve<T>(
    log: Logger,
    promiseTracker: PromiseTracker,
    render: () => T,
    location: string,
    initialRender: T,
    numberAttempts: number,
    remainingAttempts: number,
    timeoutPromise: Promise<any>,
): Promise<T | typeof timedOut> {
    if (!promiseTracker.hasWork()) {
        log.debug({ component, location }, 'No work, resolving')
        return Promise.resolve(initialRender)
    }
    if (!remainingAttempts || remainingAttempts <= 0) {
        return Promise.reject(
            new Error(`Abort waiting for loading all data after ${numberAttempts} recursive waits`),
        )
    }

    return new Promise((resolve, reject) =>
        setTimeout(() => {
            const promiseOrTimedOut = [promiseTracker.waitForCompletion(), timeoutPromise]
            Promise.race<string | typeof timedOut>(promiseOrTimedOut)
                .then(p => {
                    // If we have timed out return the timed out symbol to
                    // prevent another nested render
                    if (p === timedOut) {
                        return p
                    }

                    log.debug({ component, location }, 'Re-rendering to trigger any child promises')
                    const renderResult = render()

                    // eslint-disable-next-line consistent-return
                    return innerResolve(
                        log,
                        promiseTracker,
                        render,
                        location,
                        renderResult,
                        numberAttempts,
                        remainingAttempts - 1,
                        timeoutPromise,
                    )
                })
                .then(resolve)
                .catch(reject)
        }),
    )
}

/**
 * Utility which will recursively render the React application, triggering any
 * additional data loader recursively until no more data loads are triggered
 * or it times out, or it hits the max depth
 */
export async function recursiveTaskResolver<T>(
    log: Logger,
    promiseTracker: PromiseTracker,
    render: () => T,
    location: string,
    initialRender: T,
    numberAttempts: number,
    timeoutMs: number,
): Promise<T> {
    const timeoutPromise = delay(timeoutMs).then(() => timedOut)

    const resolved = await innerResolve<T>(
        log,
        promiseTracker,
        render,
        location,
        initialRender,
        numberAttempts,
        numberAttempts,
        timeoutPromise,
    )

    if (resolved === timedOut) {
        // Fall back to just rendering again
        log.error({ location }, `Resolving tasks timed out after ${timeoutMs}ms`)
        return render()
    }

    return resolved as T
}
