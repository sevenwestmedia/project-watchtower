import rimraf from 'rimraf'
import { Logger } from 'typescript-log'

export function clean(log: Logger, paths: string | string[]): Promise<any> {
    if (Array.isArray(paths)) {
        return Promise.all(paths.map(path => clean(log, path)))
    }

    return new Promise((resolve, reject) => {
        rimraf(paths, err => {
            if (err) {
                log.error({ err }, 'Clean error')
                reject(err)
            } else {
                resolve()
            }
        })
    })
}
