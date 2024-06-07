import { findFreePort } from '@project-watchtower/server'

export const expectPromiseToFail = (promise: Promise<any>) =>
    new Promise((resolve, reject) => {
        promise.then(() => reject('Promise was meant to fail!')).catch(() => resolve({}))
    })

export const getTestPort = () => {
    // This should allow us to seed ports with a spread of 10
    // so we can run tests in parallel
    if (!(global as any).lastPort) {
        ;(global as any).lastPort = 4000
    }
    ;(global as any).lastPort += 10

    return findFreePort((global as any).lastPort)
}
