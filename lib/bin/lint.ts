import tslint from '../lint/tslint'
import sassLint from '../lint/sass-lint'
import { log } from '../util/log'

/**
 * Runs TSLint and/or SASS-Lint
 * Paths have to contain ".ts" or ".scss" to be mapped correctly
 */
const lint = (...paths: string[]) => {
    const tslintPaths = paths.filter((p) => p.indexOf('.ts') !== -1)
    const sassLintPaths = paths.filter((p) => p.indexOf('.scss') !== -1)

    let promise: Promise<any>

    if (paths.indexOf('tslint') !== -1) {
        promise = tslint(...tslintPaths)
    } else if (paths.indexOf('sass-lint') !== -1) {
        promise = sassLint(...sassLintPaths)
    } else {
        promise = Promise.all([
            tslint(...tslintPaths),
            sassLint(...sassLintPaths),
        ])
    }

    return promise.then(() => {
        log('Linting finished without errors.')
    })
}

export default lint
