import * as rimraf from 'rimraf'

const clean: (paths: string | string[]) => Promise<any> = (paths) => {

    if (Array.isArray(paths)) {
        return Promise.all(
            paths.map((path) => clean(path)),
        )
    }

    return new Promise((resolve, reject) => {
        rimraf(paths, (err) => {
            if (err) {
                console.error('Clean error:', err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

export default clean
