import { logError } from './log'

export const failPromisesLate = (promises: Array<Promise<any>>): Promise<any> =>
    Promise.all(
        promises.map(promise => promise.then(() => true).catch(() => false)),
    ).then((results: boolean[]) => {
        if (results.indexOf(false) !== -1) {
            logError('Promise success results:', results)
            return Promise.reject('Not all promises completed successfully!')
        }

        return Promise.resolve()
    })
