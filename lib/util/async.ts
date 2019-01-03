import { Logger } from 'typescript-log'

export const failPromisesLate = (log: Logger, promises: Array<Promise<any>>): Promise<any> =>
    Promise.all(
        promises.map(promise => promise.then(() => true).catch(() => false)),
    ).then((results: boolean[]) => {
        if (results.indexOf(false) !== -1) {
            log.error({ results }, 'Promise success results')
            return Promise.reject('Not all promises completed successfully!')
        }

        return Promise.resolve()
    })
