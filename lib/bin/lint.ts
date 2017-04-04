import tslint from '../lint/tslint'
import sassLint from '../lint/sass-lint'
import { log } from '../util/log'

/**
 * Runs TSLint and SASS-Lint
 * Paths have to contain ".ts" or ".scss" to be mapped correctly
 */
const lint = (...paths: string[]) => {
    const tslintPaths = paths.filter((p) => p.indexOf('.ts') !== -1)
    const sassLintPaths = paths.filter((p) => p.indexOf('.scss') !== -1)

    return Promise.all([
        tslint(...tslintPaths),
        sassLint(...sassLintPaths),
    ]).then(() => {
        log('Linting finished without errors.')
    })
}

export default lint
