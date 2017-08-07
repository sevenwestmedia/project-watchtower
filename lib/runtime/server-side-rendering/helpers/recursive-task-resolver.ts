import { PromiseTracker, Logger } from '../../server'

const delay = (forMs: number) => new Promise((resolve) => setTimeout(resolve, forMs))
const component = 'RecursiveTaskResolver'

const timedOut = Symbol('Timed out')

function innerResolve<T>(
    log: Logger,
    promiseTracker: PromiseTracker,
    render: () => T,
    initialRender: T,
    numberAttempts: number,
    remainingAttempts: number,
    timeoutPromise: Promise<any>,
): Promise<T | typeof timedOut> {
    if (!promiseTracker.hasWork()) {
        log.debug({ component, msg: 'No work, resolving' })
        return Promise.resolve(initialRender)
    }
    if (!remainingAttempts || remainingAttempts <= 0) {
        return Promise.reject(
            new Error(`Abort waiting for loading all data after ${numberAttempts} recursive waits`),
        )
    }

    return new Promise((resolve, reject) => setTimeout(() => {
        const promiseOrTimedOut = [promiseTracker.waitForCompletion(), timeoutPromise]
        Promise.race<string | typeof timedOut>(promiseOrTimedOut)
            .then((p) => {
                // If we have timed out return the timed out symbol to
                // prevent another nested render
                if (p === timedOut) {
                    return p
                }

                log.info({ component, msg: 'Re-rendering to trigger any child promises' })
                const renderResult = render()

                // eslint-disable-next-line consistent-return
                return innerResolve(
                    log,
                    promiseTracker, render, renderResult,
                    numberAttempts, remainingAttempts - 1, timeoutPromise)
            })
            .then(resolve)
            .catch(reject)
    }))
}

export default async function<T>(
    log: Logger,
    promiseTracker: PromiseTracker,
    render: () => T,
    initialRender: T,
    numberAttempts: number,
    timeoutMs: number,
): Promise<T> {
    const timeoutPromise = delay(timeoutMs).then(() => timedOut)

    const resolved = await innerResolve<T>(
        log,
        promiseTracker, render, initialRender,
        numberAttempts, numberAttempts, timeoutPromise,
    )

    if (resolved === timedOut) {
        // Fall back to just rendering again
        log.error(`Resolving tasks timed out after ${timeoutMs}ms`)
        return render()
    }

    return resolved as T
}
